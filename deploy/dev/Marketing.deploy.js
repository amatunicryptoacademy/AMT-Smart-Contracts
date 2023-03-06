module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	const amatik = await getContract("Amatik");
	await deploy("Marketing", {
		from: deployer.address,
		contract: "Marketing",
		args: [amatik.address],
		log: true
	});

	const marketing = await getContract("Marketing");

	return [marketing];
};

module.exports.tags = ["Marketing", "dev"];
module.exports.dependencies = ["Amatik"];