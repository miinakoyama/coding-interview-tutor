export interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    tags: string[];
}

export const PROBLEMS: Problem[] = [
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        tags: ['Array', 'Hash Table']
    },
    {
        id: 'reverse-linked-list',
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        tags: ['Linked List', 'Recursion']
    },
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
        tags: ['Stack', 'String']
    },
    {
        id: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        tags: ['Hash Table', 'Linked List', 'Design']
    },
    {
        id: 'best-time-to-buy-and-sell-stock',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        description: 'You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
        tags: ['Array', 'Dynamic Programming']
    },
    {
        id: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
        tags: ['Array', 'Hash Table']
    },
    {
        id: 'maximum-subarray',
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
        tags: ['Array', 'Divide and Conquer', 'Dynamic Programming']
    },
    {
        id: 'product-of-array-except-self',
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
        tags: ['Array', 'Prefix Sum']
    },
    {
        id: '3sum',
        title: '3Sum',
        difficulty: 'Medium',
        description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
        tags: ['Array', 'Two Pointers', 'Sorting']
    },
    {
        id: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
        tags: ['Array', 'Sorting']
    },
    {
        id: 'climbing-stairs',
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        tags: ['Math', 'Dynamic Programming']
    }
];
