const rpcCall = require ('./rpcCall');

class NodeRPC {
    constructor(port) {
        this.rpcEndpoint = "http://localhost:" + port.toString() + "/json_rpc";
    }

    async getLastBlockHeight() {
        return rpcCall.executeMethod(this.rpcEndpoint,
            "get_block_count",
            {});
    }

    async getBlock(height) {
        return rpcCall.executeMethod(this.rpcEndpoint,
            "get_block",
            {height: height});
    }

    async getInfo() {
        return rpcCall.executeMethod(this.rpcEndpoint,
            "get_info",
            {});
    }

    async getHardForkInfo() {
        return rpcCall.executeMethod(this.rpcEndpoint,
            "hard_fork_info",
            {});
    }
}

module.exports.NodeRPC = NodeRPC;