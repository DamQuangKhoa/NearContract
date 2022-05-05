import { context, u128, PersistentVector, ContractPromiseBatch, logging, PersistentMap, storage } from "near-sdk-as";
import { AccountId, ONE_NEAR, asNEAR, XCC_GAS } from "./utils";
/** 
 * Exporting a new class PostedMessage so it can be used outside of this file.
 */
@nearBindgen
export class TokenContract {
  owner: string;
  TOTAL_SUPPLY: u64 = 1000000;
  balances: PersistentMap<string, u64> = new PersistentMap<string,u64>("b");
  approves: PersistentMap<string, u64> = new PersistentMap<string, u64>("a");
  miner: string;
  
  constructor(public initOwner: string) {
    logging.log("initialOwner: " + initOwner);
    this.assertInit();
    this.balances.set(initOwner, this.TOTAL_SUPPLY);
    storage.set("init", "done");
  }

    // --------------------------------------------------------------------------
  // Public VIEW methods
  // --------------------------------------------------------------------------

  get_owner(): string {
    return this.owner;
  }

  get_total_supply(): u64 {
    return this.TOTAL_SUPPLY;
  }

  getBalance(tokenOwner: string): u64 {
    logging.log("balanceOf: " + tokenOwner);
    if (!this.balances.contains(tokenOwner)) {
      return 0;
    }
    const result = this.balances.getSome(tokenOwner);
    return result;
  }

  public approve(spender: string, tokens: u64): boolean {
    logging.log("approve: " + spender + " tokens: " + tokens.toString());
    this.approves.set(context.sender + ":" + spender, tokens);
    return true;
  }

  public allowance(tokenOwner: string, spender: string): u64 {
    const key = tokenOwner + ":" + spender;
    if (!this.approves.contains(key)) {
      return 0;
    }
    return this.approves.getSome(key);
  }

  public transferFrom(from: string, to: string, tokens: u64): boolean {
      const fromAmount = this.getBalance(from);
      assert(fromAmount >= tokens, "not enough tokens on account");
      const approvedAmount = this.allowance(from, to);
      assert(tokens <= approvedAmount, "not enough tokens approved to transfer");
      this.balances.set(from, fromAmount - tokens);
      this.balances.set(to, this.getBalance(to) + tokens);
      return true;
  }

  public transferFromOwner(to: string, tokens: u64): boolean {
      const fromAmount = this.getBalance(this.owner);
      assert(fromAmount >= tokens, "not enough tokens on account");
      this.balances.set(this.owner, fromAmount - tokens);
      this.balances.set(to, this.getBalance(to) + tokens);
      return true;
  }

  public mintToken(): boolean {
    const fee = this.fee();
    assert(context.attachedDeposit >= fee, this.generate_fee_message(fee));
    const ownerAmount = this.getBalance(this.owner);
    this.miner = context.sender;
    const tokenPerNear = 1000;
    this.balances.set(this.owner, ownerAmount - tokenPerNear);
    this.balances.set(this.miner, this.getBalance(this.miner) + tokenPerNear);
    return true;
  }

   // --------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------

  private fee(): u128 {
    return ONE_NEAR;
  }

  private assertInit(): void {
      assert(storage.get<string>("init") == null, "Already initialized token supply");
  }

  private isOwner(): void {
      assert(context.sender === this.owner, "Only Owner Can Transfer Token");
  }

    private generate_fee_message(fee: u128): string {
    return ("Not Enough: " + asNEAR(fee)
      + " NEAR TO MINT");
  }
}

