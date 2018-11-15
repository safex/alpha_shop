// Copyright (c) 2018, The Safex Project
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//    conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//    of conditions and the following disclaimer in the documentation and/or other
//    materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//    used to endorse or promote products derived from this software without specific
//    prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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