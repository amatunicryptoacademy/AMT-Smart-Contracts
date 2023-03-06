const { expect } = require("chai");
const { BigNumber } = require("ethers");
const {
	ethers: {
		getContract,
		getNamedSigners,
		utils: { parseEther },
		constants,
	},
	deployments: { fixture, createFixture },
	timeAndMine: { mine }
} = require("hardhat");

const setupFixture = createFixture(async () => {
	await fixture(["", "dev"]);

	const amatik = await getContract("Amatik");
	const team = await getContract("Team");

	return [amatik, team];
});

describe("Team", function () {
	let deployer, amatik, team, blocksPerMonth;

	before("Before All: ", async function () {
		({ deployer } = await getNamedSigners());
	});

	beforeEach(async function () {
		[amatik, team] = await setupFixture();
		await amatik.transfer(team.address, parseEther("18000000"));
		blocksPerMonth = await team.BLOCKS_PER_MONTH();
	});

	describe("Initialization: ", function () {
		it("Should initialize with correct values", async function () {
			expect(await team.token()).to.equal(amatik.address);
			expect(await team.claimedAmount()).to.equal(constants.Zero);
			expect(await team.unlockedPerMonth()).to.equal(parseEther("1000000"));
			expect(await team.lockedAmount()).to.equal(parseEther("18000000"));
		});
	});
	describe("Claim", function () {
		it("Should claim", async function () {
			await mine(BigNumber.from(blocksPerMonth).mul(37));
			const tokenBalance = await amatik.balanceOf(deployer.address);
			await team.claim(parseEther("1000000"));
			expect(await amatik.balanceOf(deployer.address)).to.equal(tokenBalance.add(parseEther("1000000")));
		});
		it("Should claim after in the end when all tokens are unlocked", async function () {
			await mine(BigNumber.from(blocksPerMonth).mul(55));
			expect(await team.getUnlockedTokenAmount()).to.equal(parseEther("18000000"));
			const tokenBalance = await amatik.balanceOf(deployer.address);
			await team.claim(parseEther("18000000"));
			expect(await amatik.balanceOf(deployer.address)).to.equal(tokenBalance.add(parseEther("18000000")));
		});
		it("SHould claim every month", async function () {
			await mine(BigNumber.from(blocksPerMonth).mul(36));
			let tokenBalance = await amatik.balanceOf(deployer.address);
			for (let i = 0; i < 18; i++) {
				await mine(BigNumber.from(blocksPerMonth).mul(i + 1));
				await team.claim(parseEther("1000000"));
				tokenBalance = tokenBalance.add(parseEther("1000000"));
				expect(await amatik.balanceOf(deployer.address)).to.equal(tokenBalance);
			}
			expect(await team.claimedAmount()).to.equal(parseEther("18000000"));
			expect(await team.lockedAmount()).to.equal(parseEther("18000000"));
		});
		it("Should revert with 'Team: Insufficiant unlocked tokens'", async function () {
			await mine(BigNumber.from(blocksPerMonth).mul(37));
			await expect(team.claim(parseEther("1100000"))).to.be.revertedWith(
				"Team: Insufficiant unlocked tokens"
			);
		});
	});
	describe("getUnlockedTokenAmount function", function () {
		it("Should calculate correctly", async function () {
			expect(await team.getUnlockedTokenAmount()).to.equal(constants.Zero);
			await mine(BigNumber.from(blocksPerMonth).mul(37));
			expect(await team.getUnlockedTokenAmount()).to.equal(parseEther("1000000"));
		});
	});
});
