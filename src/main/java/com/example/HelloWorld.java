package com.example;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A simple Hello World application demonstrating basic Java features
 * without external dependencies.
 */
public class HelloWorld {

    public static void main(String[] args) {
        // Print Hello World message
        System.out.println("Hello, World!");
        System.out.println("=".repeat(50));

        // Demonstrate basic data structures
        demonstrateMap();

        // Demonstrate list operations
        demonstrateList();

        // Demonstrate simple calculations
        demonstrateCalculations();
    }

    /**
     * Demonstrates using HashMap
     */
    private static void demonstrateMap() {
        System.out.println("\n--- HashMap Example ---");

        Map<String, Object> person = new HashMap<>();
        person.put("name", "John Doe");
        person.put("age", 30);
        person.put("city", "New York");
        person.put("isStudent", false);

        System.out.println("Person Map: " + person);
        System.out.println("\nParsed values:");
        System.out.println("Name: " + person.get("name"));
        System.out.println("Age: " + person.get("age"));
        System.out.println("City: " + person.get("city"));
        System.out.println("Is Student: " + person.get("isStudent"));
    }

    /**
     * Demonstrates using ArrayList
     */
    private static void demonstrateList() {
        System.out.println("\n--- ArrayList Example ---");

        List<Map<String, Object>> people = new ArrayList<>();

        Map<String, Object> person1 = new HashMap<>();
        person1.put("name", "Alice");
        person1.put("age", 25);

        Map<String, Object> person2 = new HashMap<>();
        person2.put("name", "Bob");
        person2.put("age", 35);

        people.add(person1);
        people.add(person2);

        System.out.println("People List: " + people);

        System.out.println("\nIterate through list:");
        for (int i = 0; i < people.size(); i++) {
            Map<String, Object> person = people.get(i);
            System.out.println("Person " + (i + 1) + ": " +
                person.get("name") + ", Age: " + person.get("age"));
        }
    }

    /**
     * Demonstrates simple calculations
     */
    private static void demonstrateCalculations() {
        System.out.println("\n--- Calculation Examples ---");

        int a = 10, b = 5;
        System.out.println("Sum: " + a + " + " + b + " = " + (a + b));
        System.out.println("Difference: " + a + " - " + b + " = " + (a - b));
        System.out.println("Product: " + a + " * " + b + " = " + (a * b));
        System.out.println("Quotient: " + a + " / " + b + " = " + (a / b));
    }
}
