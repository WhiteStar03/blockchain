# blockchain

cd eth_chain && anvil
cd sui_chain && RUST_LOG="off,sui_node=info" sui start --with-faucet
cd frontend && npm run dev

