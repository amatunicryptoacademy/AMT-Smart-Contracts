module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	const amatik = await getContract("Amatik");
	await deploy("Team", {
		from: deployer.address,
		contract: "Team",
		args: [amatik.address],
		log: true
	});

	const team = await getContract("Team");

	return [team];
};

module.exports.tags = ["Team", "dev"];
module.exports.dependencies = ["Amatik"];