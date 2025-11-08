package com.example;

import org.json.JSONObject;
import org.json.JSONArray;

/**
 * A simple Hello World application demonstrating JSON parsing
 * using org.json library.
 */
public class HelloWorld {

    public static void main(String[] args) {
        // Print Hello World message
        System.out.println("Hello, World!");
        System.out.println("=".repeat(50));

        // Demonstrate JSON object creation and parsing
        demonstrateJsonObject();

        // Demonstrate JSON array creation and parsing
        demonstrateJsonArray();
    }

    /**
     * Demonstrates creating and parsing a JSON object
     */
    private static void demonstrateJsonObject() {
        System.out.println("\n--- JSON Object Example ---");

        // Create a JSON object
        JSONObject person = new JSONObject();
        person.put("name", "John Doe");
        person.put("age", 30);
        person.put("city", "New York");
        person.put("isStudent", false);

        // Print the JSON object
        System.out.println("JSON Object: " + person.toString(2));

        // Parse and access values
        System.out.println("\nParsed values:");
        System.out.println("Name: " + person.getString("name"));
        System.out.println("Age: " + person.getInt("age"));
        System.out.println("City: " + person.getString("city"));
        System.out.println("Is Student: " + person.getBoolean("isStudent"));
    }

    /**
     * Demonstrates creating and parsing a JSON array
     */
    private static void demonstrateJsonArray() {
        System.out.println("\n--- JSON Array Example ---");

        // Create a JSON array with objects
        JSONArray people = new JSONArray();

        JSONObject person1 = new JSONObject();
        person1.put("name", "Alice");
        person1.put("age", 25);

        JSONObject person2 = new JSONObject();
        person2.put("name", "Bob");
        person2.put("age", 35);

        people.put(person1);
        people.put(person2);

        // Print the JSON array
        System.out.println("JSON Array: " + people.toString(2));

        // Parse and iterate through the array
        System.out.println("\nParsed array values:");
        for (int i = 0; i < people.length(); i++) {
            JSONObject person = people.getJSONObject(i);
            System.out.println("Person " + (i + 1) + ": " +
                person.getString("name") + ", Age: " + person.getInt("age"));
        }
    }
}
