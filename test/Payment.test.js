const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { parseUnits } = require("ethers/lib/utils");
const {
	ethers: { getContract, getContractAt, getNamedSigners },
	deployments: { fixture, createFixture },
	timeAndMine
} = require("hardhat");

const setupFixture = createFixture(async () => {
	await fixture(["", "dev"]);

	const amatik = await getContract("Amatik");
	const liquidityReserve = await getContract("LiquidityReserve");
	const wbnb = await getContractAt("Amatik", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
	const factory = await getContractAt("IApeFactory", "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6");
	const pair = await factory.getPair("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amatik.address);
	const priceFeed = await getContractAt("AggregatorInterface", "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE");
	const pairContract = await getContractAt("IApePair", pair);
	const burnReserve = await getContract("BurnReserve");
	const payment = await getContract("Payment");

	return [amatik, liquidityReserve, burnReserve, pairContract, payment, priceFeed, wbnb];
});

describe("Payment", function () {
	let deployer,
		caller,
		owner,
		amatik,
		liquidityReserve,
		burnReserve,
		pairContract,
		payment,
		priceFeed,
		wbnb,
		blocksPerMonth,
		freeTrialDuration;

	before("Before All: ", async function () {
		({ deployer, caller, owner } = await getNamedSigners());
	});

	beforeEach(async function () {
		[amatik, liquidityReserve, burnReserve, pairContract, payment, priceFeed, wbnb] = await setupFixture();
		blocksPerMonth = await payment.BLOCKS_PER_MONTH();
		freeTrialDuration = await payment.freeTrialDuration();
		await liquidityReserve.approveForAddingLiquidity(payment.address);
		await amatik.transfer(liquidityReserve.address, parseUnits("100000"));
		await payment.addNewsSubscibtionPlan(1, 10);
		await payment.addNewsSubscibtionPlan(12, 120);
	});

	describe("Initialization: ", function () {
		it("Should initialize with correct values", async function () {
			expect(await payment.pair()).to.equal(pairContract.address);
			expect(await payment.priceFeed()).to.equal("0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE");
			expect(await payment.token()).to.equal(amatik.address);
			expect(await payment.burnReserve()).to.equal(burnReserve.address);
			expect(await payment.freeTrialDuration()).to.equal(50);
		});
	});

	describe("AddLesson function: ", function () {
		it("Should add new lesson", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			expect(await payment.lesson(0)).to.eql([BigNumber.from(400), 1500, 1500, true, deployer.address]);
		});

		it("Should revert with 'Paymant: Price can't be zero'", async function () {
			await expect(payment.addLesson(0, 1500, 1500, true, deployer.address)).to.be.revertedWith(
				"Paymant: Price can't be zero"
			);
		});

		it("Should revert with 'Ownable: caller is not the owner'", async function () {
			await expect(payment.connect(caller).addLesson(400, 1500, 1500, true, deployer.address)).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
		it("Should emit event NewLessonAdded", async function () {
			await expect(payment.addLesson(400, 1500, 1500, true, deployer.address))
				.to.emit(payment, "NewLessonAdded")
				.withArgs(0, 400, true);
		});
	});

	describe("getTokenAmountForCurrentPrice function", function () {
		it("Should calculate token amount correctly", async function () {
			const bnbPrice = await priceFeed.latestAnswer();
			const tokenBalance = await amatik.balanceOf(pairContract.address);
			const bnbBalance = await wbnb.balanceOf(pairContract.address);

			expect(await payment.getTokenAmountForCurrentPrice(400)).to.equal(
				parseUnits("400", 8).div(bnbPrice.div(tokenBalance.div(bnbBalance)))
			);
		});
	});

	describe("PayForLesson function", function () {
		it("Should pay for lesson", async function () {
			const tokenBlance = await amatik.balanceOf(deployer.address);
			const tutorBlance = await amatik.balanceOf(caller.address);
			const treasuryBlance = await amatik.balanceOf(owner.address);
			const paymentTokenBalance = await amatik.balanceOf(burnReserve.address);
			const pairContractBalance = await amatik.balanceOf(pairContract.address);
			const tokenAmount = await payment.getTokenAmountForCurrentPrice(400);
			// Add lesson
			await payment.addLesson(400, 1500, 1500, true, caller.address);
			// Approve tokens and pay
			await amatik.approve(payment.address, parseUnits(tokenAmount.toString()));
			await payment.payForLesson(0);
			// Check
			expect(await amatik.balanceOf(deployer.address)).to.equal(
				tokenBlance.sub(parseUnits(tokenAmount.toString()))
			);
			expect(await amatik.balanceOf(burnReserve.address)).to.equal(
				paymentTokenBalance.add(parseUnits(tokenAmount.toString()).mul(7000).div(10000))
			);
			expect(await payment.lessonAvailability(deployer.address, 0)).to.equal(true);
			expect(await amatik.balanceOf(caller.address)).to.equal(
				tutorBlance.add(parseUnits(tokenAmount.toString()).mul(1500).div(10000))
			);
			expect(await amatik.balanceOf(owner.address)).to.equal(
				treasuryBlance.add(parseUnits(tokenAmount.toString()).mul(1500).div(10000))
			);
			expect(await amatik.balanceOf(pairContract.address)).to.equal(
				pairContractBalance.add(parseUnits(tokenAmount.toString()).mul(6000).div(10000))
			);
		});
		it("Should emit event PaidForLesson", async function () {
			const amount = await payment.getTokenAmountForCurrentPrice(400);
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await amatik.approve(
				payment.address,
				parseUnits((amount).toString())
			);
			await expect(payment.payForLesson(0))
				.to.emit(payment, "PaidForLesson")
				.withArgs(0, deployer.address, 400, amount);
		});

		it("Should revert with 'Payment: Lesson with this id doesn't exist", async function () {
			await expect(payment.payForLesson(0)).to.be.revertedWith("Payment: Lesson with this id doesn't exist");
		});

		it("Should revert with 'Payment: Lesson is now unavailable", async function () {
			await payment.addLesson(400, 1500, 1500, false, deployer.address);
			await expect(payment.payForLesson(0)).to.be.revertedWith("Payment: Lesson is now unavailable");
		});

		it("Should revert with 'Payment: Lessen already paid", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(400)).toString())
			);
			// Pay for the first time
			await payment.payForLesson(0);
			// Should revert if the user tries to pay again
			await expect(payment.payForLesson(0)).to.be.revertedWith("Payment: Lessen already paid");
		});
	});

	describe("Admin functions", function () {
		it("changeLessonPrice function", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await payment.changeLessonPrice(0, 350);
			expect((await payment.lesson(0)).price).to.equal(350);
		});
		it("Should emit event LessonPriceChanged", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await expect(payment.changeLessonPrice(0, 350)).to.emit(payment, "LessonPriceChanged").withArgs(0, 350);
		});
		it("Should revert with 'Payment: Lesson with this id doesn't exist'", async function () {
			await expect(payment.changeLessonPrice(0, 350)).to.be.revertedWith(
				"Payment: Lesson with this id doesn't exist"
			);
		});
		it("Should revert with 'Paymant: Price can't be zero", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await expect(payment.changeLessonPrice(0, 0)).to.be.revertedWith("Paymant: Price can't be zero");
		});
		it("Should revert with 'Payment: Nothing to change'", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await expect(payment.changeLessonPrice(0, 400)).to.be.revertedWith("Payment: Nothing to change");
		});
		it("Should revert with 'Ownable: caller is not the owner'", async function () {
			await expect(payment.connect(caller).changeLessonPrice(0, 400)).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
		// Change Lesson Availability
		it("changeLessonAvailability function", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await payment.changeLessonAvailability(0, false);
			expect((await payment.lesson(0)).available).to.equal(false);
		});
		it("Should emit event LessonAvailabilityChanged", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await expect(payment.changeLessonAvailability(0, false))
				.to.emit(payment, "LessonAvailabilityChanged")
				.withArgs(0, false);
		});
		it("Should revert if lesson with this id doesn't exist", async function () {
			await expect(payment.changeLessonAvailability(0, false)).to.be.revertedWith(
				"Payment: Lesson with this id doesn't exist"
			);
		});
		it("Should revert if nothing will be changed", async function () {
			await payment.addLesson(400, 1500, 1500, true, deployer.address);
			await expect(payment.changeLessonAvailability(0, true)).to.be.revertedWith("Payment: Nothing to change");
		});
		it("only owner can call this function", async function () {
			await expect(payment.connect(caller).changeLessonAvailability(0, true)).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
		// change Free Trial Durtion
		it("changeFreeTrialDurtion function", async function () {
			await payment.changeFreeTrialDurtion(60);
			expect(await payment.freeTrialDuration()).to.equal(60);
		});
		it("Should emit event FreeTrialDurationChanged", async function () {
			await expect(payment.changeFreeTrialDurtion(60)).to.emit(payment, "FreeTrialDurationChanged").withArgs(60);
		});
		it("Only owner can call changeFreeTrialDurtion function", async function () {
			await expect(payment.connect(caller).changeFreeTrialDurtion(60)).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
		it("Should revert if new durations is the same", async function () {
			await expect(payment.changeFreeTrialDurtion(50)).to.be.revertedWith("Payment: Nothing to change");
		});
		// Add new subscibtion plan
		it("Should add new plan for news subscibtion", async function () {
			await payment.addNewsSubscibtionPlan(3, 350);
			expect(await payment.subscribtionPrice(3)).to.equal(350);
		});
		it("Only owner can add new plan", async function () {
			await expect(payment.connect(caller).addNewsSubscibtionPlan(1, 100)).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
		it("Should emit event NewsSubscribtionPlanAded", async function () {
			await expect(payment.addNewsSubscibtionPlan(4, 40))
				.to.emit(payment, "NewsSubscribtionPlanAded")
				.withArgs(4, 40);
		});
	});

	describe("News", function () {
		it("Activate paid plan and pay for second time", async function () {
			await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(120)).toString())
			);
			const tx = await payment.subscribeForNews(12);
			expect(await payment.subscribtionInfo(deployer.address)).to.equal(
				BigNumber.from(tx.blockNumber).add(BigNumber.from(blocksPerMonth).mul(12))
			);
			await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(10)).toString())
			);
			await payment.subscribeForNews(1);
			expect(await payment.subscribtionInfo(deployer.address)).to.equal(
				BigNumber.from(tx.blockNumber).add(BigNumber.from(blocksPerMonth).mul(13))
			);
		});
		it("Should emit event SubscibtionComplited", async function () {
			const tx = await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(120)).toString())
			);
			await expect(payment.subscribeForNews(12))
				.to.emit(payment, "SubscibtionComplited")
				.withArgs(
					12,
					deployer.address,
					BigNumber.from(tx.blockNumber).add(BigNumber.from(blocksPerMonth).mul(12)).add(1),
					120,
					await payment.getTokenAmountForCurrentPrice(120)
				);
		});
		it("Should rewrite subscibtion stratblock if previos one was expired", async function () {
			await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(10)).toString())
			);
			let tx = await payment.subscribeForNews(1);
			expect(await payment.subscribtionInfo(deployer.address)).to.equal(
				BigNumber.from(tx.blockNumber).add(blocksPerMonth)
			);
			await timeAndMine.mine(blocksPerMonth);
			await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(120)).toString())
			);
			tx = await payment.subscribeForNews(1);
			expect(await payment.subscribtionInfo(deployer.address)).to.equal(
				BigNumber.from(tx.blockNumber).add(blocksPerMonth)
			);
		});
		it("Should revert with 'Payment: Invalid subscription plan'", async function () {
			await expect(payment.subscribeForNews(2)).to.be.revertedWith("Payment: Invalid subscription plan");
		});

		it("Activate free trial", async function () {
			const tx = await payment.freeTrialActivation();
			expect(await payment.subscribtionInfo(deployer.address)).to.equal(
				BigNumber.from(tx.blockNumber).add(await payment.freeTrialDuration())
			);
		});

		it("Activate free trial1", async function () {
			const tx = await payment.freeTrialActivation();
			expect(await payment.subscribtionInfo(deployer.address)).to.equal(
				BigNumber.from(tx.blockNumber).add(freeTrialDuration)
			);
			await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(10)).toString())
			);
			await payment.subscribeForNews(1);
			expect(await payment.subscribtionInfo(deployer.address)).to.equal(
				BigNumber.from(tx.blockNumber).add(freeTrialDuration).add(blocksPerMonth)
			);
		});
		it("Should revert with 'Payment: You can't activate free trial", async function () {
			await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(10)).toString())
			);
			await payment.subscribeForNews(1);
			await expect(payment.freeTrialActivation()).to.be.revertedWith("Payment: You can't activate free trial");
		});
		it("newsAvailability function", async function () {
			expect(await payment.newsAvailability(deployer.address)).to.equal(false);
			await payment.freeTrialActivation();
			expect(await payment.newsAvailability(deployer.address)).to.equal(true);
			await timeAndMine.mine(await payment.freeTrialDuration());
			expect(await payment.newsAvailability(deployer.address)).to.equal(false);
			await amatik.approve(
				payment.address,
				parseUnits((await payment.getTokenAmountForCurrentPrice(10)).toString())
			);
			await payment.subscribeForNews(1);
			expect(await payment.newsAvailability(deployer.address)).to.equal(true);
			await timeAndMine.mine(blocksPerMonth);
			expect(await payment.newsAvailability(deployer.address)).to.equal(false);
		});
	});
});
