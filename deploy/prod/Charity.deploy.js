module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	await deploy("Charity", {
		from: deployer.address,
		contract: "Charity",
		args: ["0x970f855e0B383CF0b3224a16b856C0f2511ffc1e"],
		log: true
	});

	const charity = await getContract("Charity");

	return [charity];
};

module.exports.tags = ["Charity", "prod"];
