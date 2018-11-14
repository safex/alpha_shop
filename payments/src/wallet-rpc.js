const rpcCall = require ('./rpcCall');

/*
 * @note See if here is needed methods refreshWallet, closeWallet and so on.
 */

class WalletRPC
{
    constructor(port) {
        this.rpcEndpoint = "http://localhost:" + port.toString() + "/json_rpc";
        this.walletFilename = 'wallet_file.bin';
    }

    async open(walletFile, password = "") {
        return rpcCall.executeMethod(
            this.rpcEndpoint,
            'open_wallet',
            {
                filename: walletFile,
                password: password
            }
        );
    }

    // @warning This is not implemented currently in safex wallet RPC
    async refresh(start_height = 0) {
        return rpcCall.executeMethod(this.rpcEndpoint, 'refresh', {});
    }

    /*
    * payments - list of:
    *   payment_id - string; Payment ID matching one of the input IDs.
    *   tx_hash - string; Transaction hash used as the transaction ID.
    *   amount - unsigned int; Amount for this payment.
    *   block_height - unsigned int; Height of the block that first confirmed this payment.
    *   unlock_time - unsigned int; Time (in block height) until this payment is safe to spend.
    *   subaddr_index - subaddress index:
    *   major - unsigned int; Account index for the subaddress.
    *   minor - unsigned int; Index of the subaddress in the account.
    *   address - string; Address receiving the payment; Base58 representation of the public keys.
    * */
    async checkForPayments(paymentIds, blockHeight = 0) {
        return rpcCall.executeMethod(
            this.rpcEndpoint,
            "get_bulk_payments",
            {
                payment_ids: paymentIds,
                min_block_height: blockHeight
            }
        );
    }

    async checkForPayment(paymentId) {
        return rpcCall.executeMethod(
            this.rpcEndpoint,
            "get_payments",
            {
                payment_id : paymentId
            }
        );
    }

    async makeIntegratedAddress(paymentId) {
        let address = await this.getAddress();
        address = address.address;
        return rpcCall.executeMethod(
            this.rpcEndpoint,
            'make_integrated_address',
            {
                standard_address : address,
                payment_id : paymentId
            }
        );
    }

    async splitIntegratedAddress(integratedAddress) {
        return rpcCall.executeMethod(
            this.rpcEndpoint,
            'split_integrated_address',
            {
                integrated_address : integratedAddress
            }
        );
    }

    // @warning This is not implemented currently in safex wallet RPC
    async close() {
        return rpcCall.executeMethod(this.rpcEndpoint, 'close_wallet');
    }

    /*
     * Get address for payment.
     */
    async getAddress() {
        return rpcCall.executeMethod(this.rpcEndpoint, "get_address", {account_index: 0});
    }
}
module.exports.WalletRPC = WalletRPC;