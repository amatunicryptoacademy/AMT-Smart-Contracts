module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	const amatik = await getContract("Amatik");
	await deploy("Charity", {
		from: deployer.address,
		contract: "Charity",
		args: [amatik.address],
		log: true
	});

	const charity = await getContract("Charity");

	return [charity];
};

module.exports.tags = ["Charity", "stage"];
module.exports.dependencies = ["Amatik"];
