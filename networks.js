const FORKING_API_KEY = process.env.FORKING_API_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const DEPLOY_ENV = process.env.DEPLOY_ENV || "dev";

module.exports = {
	networks: {
		localhost: {
			chainId: 31337,
			url: "http://127.0.0.1:8545",
			tags: ["dev"],
			deploy: ["./deploy/dev"]
		},
		hardhat: {
			chainId: 31337,
			forking: {
				enabled: true,
				url: "https://rpc.ankr.com/bsc",
				// blockNumber: 22823240
			},
			accounts: {
				mnemonic: "decide sphere amateur six misery tattoo happy cluster indoor topple clerk message",
				path: "m/44'/60'/0'/0",
				initialIndex: "0",
				count: "20"
			},
			// initialDate: new Date("01/01/2021"),
			allowUnlimitedContractSize: true,
			initialBaseFeePerGas: 0,
			tags: ["dev"],
			deploy: ["./deploy/dev"],
			env: {
				name: "test variable"
			}
		},
		bsc: {
			chainId: 56,
			accounts: [""],
			// accounts: {
			// 	mnemonic: "decide sphere amateur six misery tattoo happy cluster indoor topple clerk message",
			// 	path: "m/44'/60'/0'/0",
			// 	initialIndex: 0,
			// 	count: 20
			// },
			url: "https://bsc-dataseed.binance.org",
			tags: ["prod"],
			deploy: ["./deploy/prod"]
		},
		"bsc-testnet": {
			chainId: 97,
			gasMultiplier: 1,
			accounts: ["0xb9ff58b8f639ba9b99b2cddd0a636ed315b694fe8bc29307ce4a336b06a25167"],
			// {
			// 	mnemonic: "decide sphere amateur six misery tattoo happy cluster indoor topple clerk message",
			// 	path: "m/44'/60'/0'/0",
			// 	initialIndex: 0,
			// 	count: 20
			// },
			url: "https://data-seed-prebsc-2-s1.binance.org:8545/",
			tags: ["stage"],
			deploy: ["./deploy/stage"]
		},
		goerli: {
			chainId: 5,
			accounts: {
				mnemonic: "decide sphere amateur six misery tattoo happy cluster indoor topple clerk message",
				path: "m/44'/60'/0'/0",
				initialIndex: 0,
				count: 20
			},
			url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
			tags: ["stage"],
			deploy: ["./deploy/stage"]
		}
	},
	defaultConfig: {
		gasPrice: "auto"
	}
};
