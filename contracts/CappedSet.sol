//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

contract CappedSet {

    struct Element {
        uint256 value;
        uint256 index;
    }

    mapping(address => Element) private elements;
    address[] private elementAddresses;
    uint256 public maxSize;
    uint256 public lowestValue;
    uint256 private lowestValueAddressIndex;

    constructor(uint256 _maxSize) {
        maxSize = _maxSize;
    }

    function insert(address addr, uint256 value) external returns (address newLowestAddress, uint256 newLowestValue) {
        require(addr != address(0), "Invalid address");
        require(value > 0, "Value must be greater than 0");

        // first value
        if (elementAddresses.length == 0) {
            elementAddresses.push(addr);
            elements[addr].value = value;
            elements[addr].index = 0;
            lowestValue = value;
            lowestValueAddressIndex = elements[addr].index;
            return (address(0), 0);
        }

        if (elementAddresses.length < maxSize) {
            elementAddresses.push(addr);
            elements[addr].value = value;
            elements[addr].index = elementAddresses.length - 1;

            if (value < lowestValue) {
                lowestValue = value;
                lowestValueAddressIndex = elements[addr].index;
                return (addr, value);
            } else {
                return (elementAddresses[lowestValueAddressIndex], lowestValue);
            }     
        }

        if (value == lowestValue) {
            return (elementAddresses[lowestValueAddressIndex], lowestValue);
        }
   
        address evictedAddress = elementAddresses[lowestValueAddressIndex];
        uint256 currentLowest = elements[evictedAddress].value;

        // Retained lowest elements
        elementAddresses[lowestValueAddressIndex] = addr;
        elements[addr].value = value;
        elements[addr].index = lowestValueAddressIndex;
        lowestValue = value;
        
        if (value < currentLowest) {
            lowestValueAddressIndex = elements[addr].index;
            return (addr, value);
        } else {
            for (uint256 i = 0; i < elementAddresses.length; i++) {
                address currentAddress = elementAddresses[i];
                if (elements[currentAddress].value < lowestValue) {
                    lowestValue = elements[currentAddress].value;
                    lowestValueAddressIndex = elements[currentAddress].index;
                }
            }
        }
        
        return (elementAddresses[lowestValueAddressIndex], lowestValue);
    }

    function update(address addr, uint256 newValue) external returns (address newLowestAddress, uint256 newLowestValue) {
        require(addr != address(0), "Invalid address");
        require(newValue > 0, "Value must be greater than 0");
        require(addr == elementAddresses[elements[addr].index], "Address doesn't exist");
        require(newValue != elements[addr].value, "Duplicated value");

        elements[addr].value = newValue;

        if (newValue < lowestValue) {
            lowestValueAddressIndex = elements[addr].index;
            lowestValue = newValue;
            return (addr, newValue);
        } else {
            (lowestValue, lowestValueAddressIndex) = getLowestValue();
        }

        return (elementAddresses[lowestValueAddressIndex], lowestValue);
    }

    function remove(address addr) external returns (address newLowestAddress, uint256 newLowestValue) {
        require(addr != address(0), "Invalid address");
        require(elementAddresses.length > 0, "Empty Set");
        require(elementAddresses[elements[addr].index] == addr, "Address doesn't exist");

        if( elementAddresses.length == 1){
            delete elements[addr];
            elementAddresses.pop();
            lowestValueAddressIndex = 0;
            lowestValue = 0;
            return (address(0), 0);
        }

        uint256 indexToRemove = elements[addr].index;
        uint256 valueOfIndexToRemove = elements[addr].value;
        address lastAddress = elementAddresses[elementAddresses.length - 1];

        if (indexToRemove == elementAddresses.length - 1){
            elementAddresses.pop();
            delete elements[addr];
        } else {
            elements[lastAddress].index = indexToRemove;
            elementAddresses[indexToRemove] = lastAddress;
            elementAddresses.pop();
            delete elements[addr];
        }

        if (valueOfIndexToRemove == lowestValue) {
            (lowestValue, lowestValueAddressIndex) = getLowestValue();
        } else if (elements[lastAddress].value == lowestValue) {
            lowestValueAddressIndex = indexToRemove;
        }

        return (elementAddresses[lowestValueAddressIndex], lowestValue);
    }

    function getValue(address addr) external view returns (uint256) {
        require(addr != address(0), "Invalid address");
        require(elementAddresses.length > 0, "Empty Set");
        require(addr == elementAddresses[elements[addr].index], "Address doesn't exist");
        return elements[addr].value;
    }

    function getLowestValue() internal view returns (uint256, uint256) {
        uint256 lowest = lowestValue;
        uint256 lowestIndex = lowestValueAddressIndex;

        for (uint256 i = 0; i < elementAddresses.length; i++) {
            lowest = type(uint256).max; // Initialize lowest with the maximum possible value
            address currentAddress = elementAddresses[i];
            uint256 currentValue = elements[currentAddress].value;
            if (currentValue < lowest) {
                lowest = currentValue;
                lowestIndex = i;
            }
        }

        return (lowest, lowestIndex);
    }
}