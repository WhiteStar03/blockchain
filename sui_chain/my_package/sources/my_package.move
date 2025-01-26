module 0x0::IBT {
    use sui::coin::{Self, TreasuryCap, Coin};
    use sui::event;
    use sui::types;

    /// Define the IBT struct as a one-time witness type
    public struct IBT has drop {}
    //const EUnauthorizedBurner: u64 = 0;
    const EInsufficientBalance: u64 = 1;

    /// OwnerCap represents ownership authority over the token
    public struct OwnerCap has key, store {
        id: UID
    }

    /// Event emitted when tokens are bridged from Ethereum
    public struct BridgeMint has copy, drop {
        recipient: address,
        amount: u64,
        source_chain: vector<u8>,
        source_address: vector<u8>
    }

    /// Event emitted when tokens are burned
    public struct BridgeBurn has copy, drop {
        amount: u64,
        burner: address
    }

    /// Initialize the IBT coin type and create OwnerCap
    fun init(witness: IBT, ctx: &mut TxContext) {
        assert!(types::is_one_time_witness(&witness), 0);
        
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            18,
            b"IBT",
            b"Interest Bearing Token",
            b"Bridgeable token between Ethereum and Sui",
            option::none(),
            ctx
        );

        let owner_cap = OwnerCap {
            id: object::new(ctx)
        };
        transfer::transfer(owner_cap, tx_context::sender(ctx));
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        transfer::public_transfer(metadata, tx_context::sender(ctx));
    }

    /// Mint IBT coins (only owner can call)
    public entry fun mint(
        _owner_cap: &OwnerCap,
        treasury_cap: &mut TreasuryCap<IBT>,
        amount: u64,
        recipient: address,
        source_chain: vector<u8>,
        source_address: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let coins = coin::mint(treasury_cap, amount, ctx);
        event::emit(BridgeMint {
            recipient,
            amount,
            source_chain,
            source_address
        });
        transfer::public_transfer(coins, recipient);
    }

    public entry fun bridge_burn(
    _owner_cap: &OwnerCap,
    treasury_cap: &mut TreasuryCap<IBT>,
    burn_from_address: address,
    amount: u64,
    mut coins: Coin<IBT>,
    ctx: &mut TxContext
) {
    // Verify the caller is the owner of the coins cv de testing
    //assert!(tx_context::sender(ctx) == burn_from_address, EUnauthorizedBurner);

    // Get the total balance of the input coins
    let coin_balance = coin::value(&coins);
    assert!(coin_balance >= amount, EInsufficientBalance);

    // Split the coins into burn amount and remaining
    let coins_to_burn = coin::split(&mut coins, amount, ctx);
    
    event::emit(BridgeBurn {
        amount,
        burner: burn_from_address
    });

    
    coin::burn(treasury_cap, coins_to_burn);

    // Return remaining coins to the original owner 
    if (coin::value(&coins) > 0) {
        transfer::public_transfer(coins, burn_from_address);
    } else {
        coin::destroy_zero(coins);
    }
}


    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(IBT {}, ctx)
    }
}


// sui client call --function mint --module IBT --package 0xa7a035d62cc1dda817c8c9f08dffb0b6f0aca0504ccdca558eee822962dae1b1 --args 0xcf5fe01118331b03ee3de4596cf89224e97b7c6d10324f730b6df9fc00c308d1 0xc201222d2b4167b9d6bdaf87d2d6cc15ecab0aca1782896a7ca5275c8041d5e3 1000000000000000000 0xab844d3f0d411c77c61e7c2f351425083bc8e91cfb4292f29c29dfec4a46f16a b"Ethereum" b"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" --gas-budget 1000000000   