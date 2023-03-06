module.exports = async ({
	deployments: { deploy },
	ethers: {
		getNamedSigners,
		getContract,
		getContractAt,
		utils: { parseEther },
		provider
	}
}) => {
	const { deployer } = await getNamedSigners();
	const amatik = await getContractAt("Amatik", "0xE8EbCf4Fd1faa9B77c0ec0B26e7Cc32a251Cd799");
	await deploy("LotteryMock", {
		from: deployer.address,
		contract: "LotteryMock",
		args: [amatik.address, "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE", "0xA7C73e46053dd33e1D750904b84D6C2383f6Ac01"],
		log: true
	});

	const lottery = await getContract("LotteryMock");

	return lottery;
};

module.exports.tags = ["Lottery", "dev"];
module.exports.dependencies = ["Amatik"];
