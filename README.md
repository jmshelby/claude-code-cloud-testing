# Hello World Java Maven Project

A simple Hello World Java application demonstrating basic Java features using only the Java standard library.

## Project Structure

```
.
├── pom.xml
├── README.md
├── DEBUGGING_NOTES.md
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

- **No external dependencies** - Uses only Java standard library (HashMap, ArrayList, etc.)

## Requirements

- Java 11 or higher
- Maven 3.6 or higher (optional - can build with javac directly)

## Building the Project

### Option 1: Using javac (Recommended for restricted networks)

To compile the project directly with javac:

```bash
javac -d target/classes src/main/java/com/example/HelloWorld.java
```

### Option 2: Using Maven

To compile with Maven (requires network access to download plugins):

```bash
mvn clean compile
```

## Running the Application

### After compiling with javac:

```bash
java -cp target/classes com.example.HelloWorld
```

### After compiling with Maven:

```bash
mvn exec:java
```

Or:

```bash
mvn clean package
java -cp target/hello-world-1.0-SNAPSHOT.jar com.example.HelloWorld
```

## What the Application Does

The HelloWorld application demonstrates:

1. **Hello World Message**: Prints a simple greeting
2. **HashMap Usage**: Creates and manipulates a HashMap with person information
3. **ArrayList Operations**: Creates and iterates through a list of person objects
4. **Basic Calculations**: Demonstrates arithmetic operations

## Example Output

```
Hello, World!
==================================================

--- HashMap Example ---
Person Map: {city=New York, name=John Doe, age=30, isStudent=false}

Parsed values:
Name: John Doe
Age: 30
City: New York
Is Student: false

--- ArrayList Example ---
People List: [{name=Alice, age=25}, {name=Bob, age=35}]

Iterate through list:
Person 1: Alice, Age: 25
Person 2: Bob, Age: 35

--- Calculation Examples ---
Sum: 10 + 5 = 15
Difference: 10 - 5 = 5
Product: 10 * 5 = 50
Quotient: 10 / 5 = 2
```
