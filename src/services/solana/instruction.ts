import BN from "bn.js"
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { Keypair, Connection, PublicKey, Transaction, TransactionInstruction, Signer, Commitment, TransactionSignature, SystemProgram } from "@solana/web3.js"

import { WalletAdapter } from "~/services/wallet-adapters/types"
export namespace IBPort {
  export type CreateTransferUnwrapRequest = {
    amount: BN
    receiver: Uint8Array
  }
  export class IntructionObject {
    static burnFunds(amount: string, receiver: string): CreateTransferUnwrapRequest {
      return {
        amount: new BN(amount),
        receiver: Buffer.from(receiver),
      }
    }
  }
  export class Broadcaster {
    connection: Connection
    adapter: WalletAdapter

    constructor(adapter: WalletAdapter, endpoint: string, commitment: Commitment) {
      this.adapter = adapter
      this.connection = new Connection(endpoint, commitment)
      // this.connection = new Connection("http://localhost:8899", 'singleGossip');
    }

    async broadcastTransaction(tx: Transaction, signers: Signer[]): Promise<TransactionSignature> {
      const response = await this.connection.sendTransaction(tx, signers, { skipPreflight: false, preflightCommitment: "singleGossip" })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      return response
    }

    async broadcast(txInstruction: TransactionInstruction, signers: Signer[]) {
      const tx = new Transaction().add(txInstruction)
      await this.connection.sendTransaction(tx, signers, { skipPreflight: false, preflightCommitment: "singleGossip" })

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    async signAndBroadcast(transaction: Transaction) {
      const { connection, adapter: wallet } = this
      const { blockhash } = await connection.getRecentBlockhash()

      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      const signed = await wallet.signTransaction(transaction)

      const txid = await connection.sendRawTransaction(signed.serialize())
      const resp = await connection.confirmTransaction(txid)

      console.log({ signed, txid, resp })
    }
  }

  export class Invoker {
    instructionBuilder: InstructionBuilder
    broadcaster: Broadcaster

    adapter: WalletAdapter

    constructor(adapter: WalletAdapter, builderProps: InstructionBuilderProps, connectionEndpoint: string) {
      this.adapter = adapter
      this.instructionBuilder = new InstructionBuilder(builderProps)
      this.broadcaster = new Broadcaster(this.adapter, connectionEndpoint, "confirmed")
    }

    get connection(): Connection {
      return this.broadcaster.connection
    }

    get initializer(): PublicKey {
      return this.instructionBuilder.initializer
    }

    async createTokenAccount(tokenBinary: PublicKey) {
      // const lamports = await this.broadcaster.connection.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip")
      // const [createTokenAccount, initTokenAccount] = this.instructionBuilder.buildCreateTokenAccountInstructionForInitializer(lamports, tokenBinary)
      // // console.log({ createTokenAccountIx })
      // // transaction.add
      // const tx = new Transaction().add(createTokenAccount, initTokenAccount)
      // const resp = await this.broadcaster.signAndBroadcast(tx)

      // console.log({ broadcast: resp })
      // this.instructionBuilder.setTokenOwner()

      // const token = new Token(this.broadcaster.connection, tokenBinary, TOKEN_PROGRAM_ID, new Keypair())
      const tx = new Transaction()
      const instructions = []
      const account = new Keypair()

      const accountRentExempt = await this.connection.getMinimumBalanceForRentExemption(AccountLayout.span)

      instructions.push(
        SystemProgram.createAccount({
          fromPubkey: this.initializer,
          newAccountPubkey: account.publicKey,
          lamports: accountRentExempt,
          space: AccountLayout.span,
          programId: TOKEN_PROGRAM_ID,
        })
      )

      instructions.push(Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, tokenBinary, this.initializer, this.instructionBuilder.tokenOwner))

      // signers.push(account);
      const { blockhash } = await this.connection.getRecentBlockhash()

      tx.recentBlockhash = blockhash
      tx.feePayer = this.initializer

      tx.add(...instructions)
      tx.sign(account)
      // tx.sign

      console.log({ account: account.publicKey, accountP: account.secretKey })

      try {
        const resp = await this.broadcaster.broadcastTransaction(tx, [account])
        console.log({ resp })
      } catch (err) {
        console.log({ err })
      }
      // let sentTx = await sendTransaction(
      //   this.connection,
      //   wallet,
      //   instructions.concat(cleanupInstructions),
      //   signers
      // );

      // // await this.broadcaster.signAndBroadcast(tx)

      // const signed = await wallet.signTransaction(transaction)

      // const txid = await connection.sendRawTransaction(signed.serialize())
      // const resp = await connection.confirmTransaction(txid)
    }

    async createTransferUnwrapRequest(amount: string, receiver: string) {
      // const instructionObject = IntructionObject.burnFunds(amount, receiver)
      // const createTokenAccountIx = this.instructionBuilder.buildCreateTokenAccountInstructionForInitializer()
      // // transaction.add
      // const tx = new Transaction().add(createTokenAccountIx)
      // await this.broadcaster.broadcastTransaction(tx)
    }
  }

  export type InstructionBuilderProps = { initializer: PublicKey; ibportProgram: PublicKey; tokenProgramAccount: PublicKey; spenderTokenAccount: PublicKey; tokenOwner: PublicKey }
  export class InstructionBuilder {
    // initializer: Keypair
    initializer: PublicKey

    ibportProgram: PublicKey
    spenderTokenAccount: PublicKey
    tokenProgramAccount: PublicKey

    tokenOwner: PublicKey

    constructor(props: InstructionBuilderProps) {
      this.initializer = props.initializer

      this.ibportProgram = props.ibportProgram
      this.spenderTokenAccount = props.spenderTokenAccount
      this.tokenProgramAccount = props.tokenProgramAccount

      this.tokenOwner = props.tokenOwner
    }

    updateTokenOwner(tokenOwner: PublicKey) {
      this.tokenOwner = tokenOwner
    }

    async getIBPortPDA(): Promise<PublicKey> {
      return await PublicKey.createProgramAddress([Buffer.from("ibport")], this.ibportProgram)
    }

    buildCreateTokenAccountInstructionForInitializer(lamports: number, tokenBinary: PublicKey): TransactionInstruction[] {
      return this.buildCreateTokenAccountInstruction(this.initializer, tokenBinary, lamports)
    }

    buildCreateTokenAccountInstruction(_tokenHolder: PublicKey, tokenBinary: PublicKey, lamports: number): TransactionInstruction[] {
      const createTokenAccount = SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: AccountLayout.span,
        lamports,
        fromPubkey: _tokenHolder,
        newAccountPubkey: tokenBinary,
      })
      const initTokenAccount = Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, this.tokenProgramAccount, tokenBinary, this.tokenOwner)

      return [createTokenAccount, initTokenAccount]
    }

    async buildCreateTransferUnwrapRequest(raw: CreateTransferUnwrapRequest): Promise<TransactionInstruction> {
      // Instruction Index = u8
      let rawData = Uint8Array.of(...new BN(1).toArray("le", 1))
      // Token Amount = f64
      rawData = Uint8Array.of(...rawData, ...new BN(raw.amount).toArray("le", 8))
      // Receiver
      rawData = Uint8Array.of(...rawData, ...raw.receiver)

      const data = Buffer.from(rawData)

      console.log(raw.amount)
      console.log(raw.receiver)

      const tx = new TransactionInstruction({
        programId: this.ibportProgram,
        keys: [
          {
            pubkey: this.initializer.publicKey,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
          },
          {
            // Token deployed and bind to TOKEN_PROGRAM_ID
            // actually it's result of `spl-token create-token`
            pubkey: this.tokenProgramAccount,
            isSigner: false,
            isWritable: true,
          },
          {
            // the man we allowed to burn tokens from (caller)
            pubkey: this.spenderTokenAccount,
            isSigner: false,
            isWritable: true,
          },
          {
            // IB Port PDA
            pubkey: await this.getIBPortPDA(),
            isSigner: false,
            isWritable: false,
          },
        ],
        data,
      })
      return tx
    }
  }
}
