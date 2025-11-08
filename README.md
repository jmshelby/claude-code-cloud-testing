# Hello World Java Maven Project

A simple Hello World Java application demonstrating JSON parsing using the `org.json` library.

## Project Structure

```
.
├── pom.xml
├── README.md
└── src
    ├── main
    │   └── java
    │       └── com
    │           └── example
    │               └── HelloWorld.java
    └── test
        └── java
```

## Dependencies

- **org.json:json** (version 20231013) - JSON parsing library

## Requirements

- Java 11 or higher
- Maven 3.6 or higher

## Building the Project

To compile the project, run:

```bash
mvn clean compile
```

## Running the Application

To run the application, use:

```bash
mvn exec:java
```

Or after building, you can run:

```bash
mvn clean package
java -cp target/hello-world-1.0-SNAPSHOT.jar com.example.HelloWorld
```

## What the Application Does

The HelloWorld application demonstrates:

1. **Hello World Message**: Prints a simple greeting
2. **JSON Object Creation**: Creates and parses a JSON object with person information
3. **JSON Array Handling**: Creates and iterates through a JSON array of objects

## Example Output

```
Hello, World!
==================================================

--- JSON Object Example ---
JSON Object: {
  "city": "New York",
  "isStudent": false,
  "name": "John Doe",
  "age": 30
}

Parsed values:
Name: John Doe
Age: 30
City: New York
Is Student: false

--- JSON Array Example ---
JSON Array: [
  {
    "name": "Alice",
    "age": 25
  },
  {
    "name": "Bob",
    "age": 35
  }
]

Parsed array values:
Person 1: Alice, Age: 25
Person 2: Bob, Age: 35
```
