import { ethers } from "hardhat"
import { assert, expect } from "chai"
import { CappedSet } from "../../typechain-types"
import { mine } from '../util/nodeUtil'

describe("CappedSet", function () {
    let cappedSet: CappedSet
    let addresses: string[]

    beforeEach(async function () {
        const CappedSet = await ethers.getContractFactory("CappedSet")
        cappedSet = await CappedSet.deploy(5)
        await mine(1)
        // Generate local addresses for testing
        addresses = Array.from({ length: 8 }, () => ethers.Wallet.createRandom().address)
    })

    describe("Insert", function () {
        it("Should insert a new element", async function () {
            const tx = await cappedSet.insert(addresses[0], 15)
            await tx.wait()

            const value = await cappedSet.getValue(addresses[0])
            expect(value).to.equal(15)
        })

        it("Should evict the lowest value if the set is at its maximum size", async function () {
            await cappedSet.insert(addresses[0], 15)
            await cappedSet.insert(addresses[1], 15)
            await cappedSet.insert(addresses[2], 6)
            await cappedSet.insert(addresses[3], 3)
            await cappedSet.insert(addresses[4], 4)
            await cappedSet.insert(addresses[5], 2)

            const tx = await cappedSet.insert(addresses[4], 8)
            await tx.wait()
        
            const value = await cappedSet.getValue(addresses[4])
            expect(value).to.equal(8)
        
            const lowestValue = await cappedSet.getValue(addresses[0])
            expect(lowestValue).to.equal(15)
        })
    })

    describe("Update", function () {
        it("Should update the value of an existing element", async function () {
            await cappedSet.insert(addresses[0], 15)

            const tx = await cappedSet.update(addresses[0], 10)
            await tx.wait()

            const value = await cappedSet.getValue(addresses[0])
            expect(value).to.equal(10)
        })

        it("Should evict the lowest value if the updated value is lower", async function () {
            await cappedSet.insert(addresses[0], 15)
            await cappedSet.insert(addresses[1], 12)
            await cappedSet.insert(addresses[2], 9)
            await cappedSet.insert(addresses[3], 8)
            await cappedSet.insert(addresses[4], 1)

            const tx = await cappedSet.update(addresses[2], 5)
            await tx.wait()

            const value = await cappedSet.getValue(addresses[2])
            expect(value).to.equal(5)

            const lowestValue = await cappedSet.getValue(addresses[4])
            expect(lowestValue).to.equal(1)
        })
    })

    describe("Remove", function () {
        it("Should remove an existing element and return it doesn't exist error", async function () {
            const tx1 = await cappedSet.insert(addresses[3], 7)
            await tx1.wait()
            const tx2 = await cappedSet.insert(addresses[3], 7)
            await tx2.wait()
            const tx3 = await cappedSet.insert(addresses[0], 15)
            await tx3.wait()

            const tx4 = await cappedSet.remove(addresses[0])
            await tx4.wait()

            await expect(cappedSet.getValue(addresses[0])).to.be.revertedWith("Address doesn't exist")
        })
    
        it("Should update the lowest value after removing an element", async function () {
            const tx1 = await cappedSet.insert(addresses[0], 15)
            await tx1.wait()
            const tx2 = await cappedSet.insert(addresses[1], 12)
            await tx2.wait()
            const tx3 = await cappedSet.insert(addresses[2], 9)
            await tx3.wait()
            const tx4 = await cappedSet.insert(addresses[3], 8)
            await tx4.wait()
            const tx5 = await cappedSet.insert(addresses[4], 1)
            await tx5.wait()
        
            const tx6 = await cappedSet.remove(addresses[4])
            await tx6.wait()
        
            const lowestValue = await cappedSet.getValue(addresses[3])
            expect(lowestValue).to.equal(8)
        })
    })
    
    describe("GetValue", function () {
        it("Should return the value of an existing element", async function () {
            const tx1 = await cappedSet.insert(addresses[0], 15)
            await tx1.wait()
    
            const value = await cappedSet.getValue(addresses[0])
            expect(value).to.equal(15)
        })
    
        it("Should return the right error for a non-existing element", async function () {

            it("should return the right error for a non-existing element", async () => {
                const tx1 = await cappedSet.insert(addresses[3], 9)
                await tx1.wait()
                const nonExistingAddress = addresses[1]
                try {
                  await cappedSet.getValue(nonExistingAddress)
                  assert.fail("Expected an error but none was received")
                } catch (error) {
                    assert.equal(error, "Address doesn't exist")
                }
            })

            it("should return the right error for an empty SET", async() =>{
                const nonExistingAddress = addresses[1]
                try {
                    await cappedSet.getValue(nonExistingAddress)
                    assert.fail("Expected an error but none was received")
                } catch (error) {
                    assert.equal(error, "Set is empty")
                }
            })
        })
    })
})