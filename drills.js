'use strict';

const Memory = require('./memory');

let memory = new Memory();


/* 
Arrays = an ordered sequence of data (and potentially empty spaces). Data is stored in contiguous memory (all of the array data is stored in order at subsequent memory addresses)
What is a problem with trying to implement your own array in JS? JavaScript doesnt give you direct access to the underlying memory in your system.

*/

class Array {
    constructor() {
        this.length = 0;
        this._capacity = 0; // how many items you can hold without needing to resize
        this.ptr = memory.allocate(this.length);
    }

    // push a new element to the end of the array
    push(value) {
        this._resize(this.length + 1); // increase the amount of memory which you have reserved so you cna have space for the new item
        memory.set(this.ptr + this.length, value); // set the value of the final block to contain the new value
        this.length++;
    }
    // Since you have to copy each item of data to a new box each time you resize the array, the time complexity would be O(n)
    _resize(size) {
        const oldPtr = this.ptr;
        this.ptr = memory.allocate(size);
        if (this.ptr === null) {
            throw new Error('Out of memory');
        }
        memory.copy(this.ptr, oldPtr, this.length);
        memory.free(oldPtr);
        this._capacity = size;
    }

    // add an index offset & get the value stored at a memory address. O(1)
    get(index) {
        if (index < 0 || index >= this.length) {
            throw new Error('Index error');
        }
        return memory.get(this.ptr + index);
    }

    // pop a value from the end of an array. This is just some pointer arithmetic and memory access so its O(1);
    pop() {
        if (this.length === 0) {
            throw new Error('Index error');
        }
        const value = memory.get(this.ptr + this.length - 1);
        this.length--;
        return value;
    }
    // insert a value into any point in an array. Shifts all of the values AFTER the new value back 1 position. Then you put the new value in its correct place. 
    insert(index, value) {
        if (index < 0 || index >= this.length) {
            throw new Error('Index error');
        }
        if (this.length >= this._capacity) {
            this._resize((this.length + 1) * Array.SIZE_RATIO);
        }

        memory.copt(this.ptr + index + 1, this.ptr + index, this.length - index);
        memory.set(this.ptr + index, value);
        this.length++;
    }
    // similar to inserting, except you are copying the values backwards to fill the space where you removed the value rather than forwards to make space for a new value. 
    remove(index) {
        if (index < 0 || index >= this.length) {
            throw new Error('Index error');
        }
        memory.copy(this.ptr + index, this.ptr + index + 1, this.length - index - 1);
        this.length--;
    }
}

Array.SIZE_RATIO = 3; // if the length is greater than the capacity then you resize according to the SIZE_RATIO. In this case, each time you go over the capacity, you triple the size of memory which is allocated.
// tradeoff = wasting some memory when the capacity is greater than the length. 