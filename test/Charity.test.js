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
	const charity = await getContract("Charity");

	return [amatik, charity];
});

describe("Charity", function () {
	let deployer, amatik, charity, blocksPerMonth;

	before("Before All: ", async function () {
		({ deployer } = await getNamedSigners());
	});

	beforeEach(async function () {
		[amatik, charity] = await setupFixture();
		await amatik.transfer(charity.address, parseEther("2000000"));
		blocksPerMonth = await charity.BLOCKS_PER_MONTH();
	});

	describe("Initialization: ", function () {
		it("Should initialize with correct values", async function () {
			expect(await charity.token()).to.equal(amatik.address);
			expect(await charity.claimedAmount()).to.equal(constants.Zero);
			expect(await charity.unlockedPerMonth()).to.equal(parseEther("80000"));
			expect(await charity.lockedAmount()).to.equal(parseEther("2000000"));
		});
	});
	describe("Claim", function () {
		it("Should claim", async function () {
			await mine(BigNumber.from(blocksPerMonth).mul(18));
			const tokenBalance = await amatik.balanceOf(deployer.address);
			await charity.claim(parseEther("80000"));
			expect(await amatik.balanceOf(deployer.address)).to.equal(tokenBalance.add(parseEther("80000")));
		});
		it("Should claim after in the end when all tokens are unlocked", async function () {
			await mine(BigNumber.from(blocksPerMonth).mul(41));
			expect(await charity.getUnlockedTokenAmount()).to.equal(parseEther("2000000"));
			const tokenBalance = await amatik.balanceOf(deployer.address);
			await charity.claim(parseEther("2000000"));
			expect(await amatik.balanceOf(deployer.address)).to.equal(tokenBalance.add(parseEther("2000000")));
		});
		it("SHould claim every month", async function () {
			await mine(BigNumber.from(blocksPerMonth).mul(16));
			let tokenBalance = await amatik.balanceOf(deployer.address);
			for (let i = 0; i < 25; i++) {
				await mine(BigNumber.from(blocksPerMonth).mul(i + 1));
				await charity.claim(parseEther("80000"));
				tokenBalance = tokenBalance.add(parseEther("80000"));
				expect(await amatik.balanceOf(deployer.address)).to.equal(tokenBalance);
			}
			expect(await charity.claimedAmount()).to.equal(parseEther("2000000"));
			expect(await charity.lockedAmount()).to.equal(parseEther("2000000"));
		});
		it("Should revert with 'Charity: Insufficiant unlocked tokens'", async function () {
			await mine(BigNumber.from(blocksPerMonth).mul(17));
			await expect(charity.claim(parseEther("100000"))).to.be.revertedWith(
				"Charity: Insufficiant unlocked tokens"
			);
		});
	});
	describe("getUnlockedTokenAmount function", function () {
		it("Should calculate correctly", async function () {
			expect(await charity.getUnlockedTokenAmount()).to.equal(constants.Zero);
			await mine(BigNumber.from(blocksPerMonth).mul(17));
			await mine(BigNumber.from(blocksPerMonth).div(2));
			expect(await charity.getUnlockedTokenAmount()).to.equal(parseEther("80000"));
		});
	});
});
