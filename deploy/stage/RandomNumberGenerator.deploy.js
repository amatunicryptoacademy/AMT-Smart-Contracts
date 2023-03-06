module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract, utils } }) => {
	const { deployer } = await getNamedSigners();
	const lottery = await getContract("Lottery");
	await deploy("RandomNumberGenerator", {
		from: deployer.address,
		contract: "RandomNumberGenerator",
		args: ["0xa555fC018435bef5A13C6c6870a9d4C11DEC329C", "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06", lottery.address, "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186", utils.parseEther("0.1")],
		log: true
	});

	const randomNumberGenerator = await getContract("RandomNumberGenerator");

	return randomNumberGenerator;
};

module.exports.tags = ["RandomNumberGenerator", "stage"];
module.exports.dependencies = ["Lottery"];
