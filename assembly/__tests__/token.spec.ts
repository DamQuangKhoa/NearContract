import { VMContext, u128 } from "near-sdk-as";
import { TokenContract } from "..";
import { ONE_NEAR } from "../utils";


const contract = "token"
const owner = "alice"
const bob = "bob"
const carol = "carol"

let token: TokenContract;

beforeEach(() => {
  VMContext.setCurrent_account_id(contract)
  VMContext.setAccount_balance(ONE_NEAR) // resolves HostError(BalanceExceeded)
  token = new TokenContract(owner);
})

describe("04. Token", () => {

  it("initially has " + token.get_total_supply().toString + " tokens", () => {
    expect(token.getBalance(owner).toString()).toBe("1000000");
  });

   it("owner can transfer token to bob ", () => {
    const ownerStartBalance = token.getBalance(owner);
    const bobStartBalance = token.getBalance(bob);

    token.transferFromOwner(bob , 100);

    const ownerBalance = token.getBalance(bob);
    const bobBalance = token.getBalance(bob);
    expect(ownerBalance).toBe(ownerStartBalance - 100);
    expect(bobBalance).toBe(bobStartBalance + 100);
  });

  it("can transfer to other account", () => {
    const bobStartBalance = token.getBalance(bob);
    const carolStartBalance = token.getBalance(carol);

    token.approve(bob, 1000);

    token.transferFrom(bob, carol, 10);

    const bobEndBalance = token.getBalance(bob);
    const carolEndBalance = token.getBalance(carol);
    expect(bobEndBalance).toBe(bobStartBalance - 10);
    expect(carolEndBalance).toBe(carolStartBalance + 10);
  });
});