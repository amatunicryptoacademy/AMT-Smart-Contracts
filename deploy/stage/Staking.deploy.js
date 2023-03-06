module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	// const amatik = await getContract("Amatik");
	await deploy("Staking", {
		from: deployer.address,
		contract: "Staking",
		args: ["0xd130E6c157EbcEcc619Cde6D8919b1F3b993e1c0"],
		log: true
	});

	const staking = await getContract("Staking");

	return [staking];
};

module.exports.tags = ["Staking", "stage"];
// module.exports.dependencies = ["Amatik"];
