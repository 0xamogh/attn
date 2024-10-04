export const ATTENTION_ESCROW_ADDRESS='0x13f6803b21f79e96b2fd15ef6c26000931b9bf15'
export const ATTENTION_ESCROW_ABI=JSON.parse('[{"type":"constructor","inputs":[{"name":"_verifier","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},{"type":"function","name":"approveOrder","inputs":[{"name":"_orderId","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"completeOrder","inputs":[{"name":"_orderId","type":"string","internalType":"string"},{"name":"_recipient","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"createOrder","inputs":[{"name":"_orderId","type":"string","internalType":"string"},{"name":"_expiry","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"payable"},{"type":"function","name":"getOrderState","inputs":[{"name":"_orderId","type":"string","internalType":"string"}],"outputs":[{"name":"","type":"uint8","internalType":"enum AttentionEscrow.State"}],"stateMutability":"view"},{"type":"function","name":"getOrderStates","inputs":[{"name":"_orderIds","type":"string[]","internalType":"string[]"}],"outputs":[{"name":"","type":"uint8[]","internalType":"enum AttentionEscrow.State[]"}],"stateMutability":"view"},{"type":"function","name":"orders","inputs":[{"name":"","type":"string","internalType":"string"}],"outputs":[{"name":"orderId","type":"string","internalType":"string"},{"name":"state","type":"uint8","internalType":"enum AttentionEscrow.State"},{"name":"amount","type":"uint256","internalType":"uint256"},{"name":"expiry","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"refundOrder","inputs":[{"name":"_orderId","type":"string","internalType":"string"},{"name":"_depositor","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"rejectOrder","inputs":[{"name":"_orderId","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"verifier","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"event","name":"OrderApproved","inputs":[{"name":"orderId","type":"string","indexed":true,"internalType":"string"}],"anonymous":false},{"type":"event","name":"OrderCompleted","inputs":[{"name":"orderId","type":"string","indexed":true,"internalType":"string"}],"anonymous":false},{"type":"event","name":"OrderCreated","inputs":[{"name":"orderId","type":"string","indexed":true,"internalType":"string"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"expiry","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"OrderRefunded","inputs":[{"name":"orderId","type":"string","indexed":true,"internalType":"string"}],"anonymous":false},{"type":"event","name":"OrderRejected","inputs":[{"name":"orderId","type":"string","indexed":true,"internalType":"string"}],"anonymous":false}]')
