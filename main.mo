import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

actor {
    stable var ethBalances : Trie.Map Text Nat = Trie.Map.empty<Text, Nat>();

    public func deposit(user: Text, amount: Nat) : async () {
        let current = ethBalances.get(user) ?? 0;
        ethBalances.put(user, current + amount);
        Debug.print("Deposited " # Nat.toText(amount) # " ETH for " # user);
    };

    public func withdraw(user: Text, amount: Nat) : async Bool {
        let current = ethBalances.get(user) ?? 0;
        if (current >= amount) {
            ethBalances.put(user, current - amount);
            Debug.print("Withdrew " # Nat.toText(amount) # " ETH for " # user);
            return true;
        };
        return false;
    };

    public query func getBalance(user: Text) : async Nat {
        return ethBalances.get(user) ?? 0;
    };
};
