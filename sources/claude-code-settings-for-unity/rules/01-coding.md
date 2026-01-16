---
paths:
  - "**/*.cs"
---

# Coding Guidelines

## Basic Principles

- Keep It Simple, Stupid.
- Adhere to the SOLID principles, especially the Single Responsibility Principle, the Interface Segregation Principle,
  and the Dependency Inversion Principle.
- Before you write any code, read .editorconfig file.

## Structure

- Editor extension code goes under the `Editor/` directory.
- Runtime code goes under the `Runtime/` directory.
- A file contains only one public class or interface.

## Naming

### Fields and Variables

- Use nouns for variable names: Variable names should be clear and descriptive because they represent a specific thing
  or state. Use a noun when naming them except when the variable is of the type bool.
- Prefix Booleans with a verb: These variables indicate a true or false value. Often they are the answer to a question,
  such as: Is the player running? Is the game over?
    - Prefix them with a verb to make their meaning more apparent. Often this is paired with a description or condition,
      e.g., isDead, isWalking, hasDamageMultiplier, etc.
- Use meaningful names. Don't abbreviate (unless it's math): Your variable names will reveal their intent. Choose names
  that are easy to pronounce and search for.
    - While single-letter variables are fine for loops and math expressions, don't abbreviate in other situations.
      Clarity is more important than any time saved from omitting a few vowels.
    - For quick prototyping, you can use short "junk" names temporarily, and then refactor to more meaningful names
      later on.
- Use PascalCase for public fields, and use camelCase with a prefix "_" for private variables: For an alternative to
  public fields, use properties with a public "getter".
- Use camelCase and start with "s_" for static fields.

### Properties

- Use auto-implemented properties when no additional logic is needed in the property accessors.
- For serialized properties in Unity, use the following pattern to make them visible in the Inspector:
    ```csharp
    [field: SerializeField]
    public int SerializedProperty { get; set; } = defaultValue;
    ```
  This pattern applies the SerializeField attribute to the backing field while keeping the property public.
- When applying Unity attributes to auto-implemented properties, always use the `field:` target to apply the attribute to the backing field. This applies to all serialization-related attributes (e.g., `HideInInspector`, `Range`, `Tooltip`, `Header`, etc.):
    ```csharp
    [field: SerializeField]
    [field: HideInInspector]
    [field: Range(0, 100)]
    public int Health { get; set; }
    ```
- Place property documentation comments above the property, not above the attribute.

### Enums

- Use PascalCase for enum names and values. You can place public enums outside of a class to make them global. Use a
  singular noun for the enum name.
- Note: Bitwise enums marked with the System.FlagsAttribute are the exception to this rule. You typically pluralize
  these as they represent more than one type.

### Classes and Interfaces

- Use PascalCase nouns for class names: This will keep your classes organized.
- If you have a MonoBehaviour in a file, the source file name must match: You might have other internal classes in the
  file, but only one MonoBehaviour should exist per file.
- Prefix interface names with a capital "I": Follow this with an adjective that describes the functionality.
- Abstract class names do not have a prefix or suffix, but implementation classes have the abstract class name as a suffix.

### Methods

- Start the name with a verb: Add context if necessary (e.g., GetDirection, FindTarget, etc.)
- Use camelCase for parameters: Format parameters passed into the method like local variables.
- Methods returning bool should ask questions: Much like Boolean variables themselves, prefix methods with a verb if they return a true-false condition. This phrases them in the form of a question (e.g., IsGameOver, HasStartedTurn).

### Events and Event Handlers

- Name the event with a verb phrase. Be sure to choose one that communicates the state change accurately.
- Use the present or past participle to indicate the state of events as before or after. For example, specify "
  OpeningDoor" for an event before opening a door and "DoorOpened" for an event afterward.
- Use System.Action
    - Use the System.Action delegate for events. In most cases, the Action<T> delegate can handle the events needed for
      gameplay.
    - You can pass up to 16 input parameters of different types with a return type of void. Using the predefined
      delegate saves code.
    - Note: You can also use the EventHandler or EventHandler<TEventArgs> delegates. Agree as a team on how everyone
      should implement events.
- Prefix the event raising method (in the subject) with "On." The subject that invokes the event typically does so from
  a method prefixed with "On" (e.g., "OnOpeningDoor" or "OnDoorOpened").
- Prefix the event handling method (in the observer) with the subject's name and an underscore (_). If the subject is
  named "GameEvents," your observers can have a method called "GameEvents_OpeningDoor" or "GameEvents_DoorOpened."
- Create custom EventArgs only if necessary. If you need to pass custom data to your Event, create a new type of
  EventArgs, either inherited from System.EventArgs or from a custom struct.

### Namespaces

- Use PascalCase without special symbols or underscores.
- Add a using directive at the top of the file to avoid repeated typing of the namespace prefix.
- Create sub-namespaces as well. Use the dot(.) operator to delimit the name levels, allowing you to organize your
  scripts into hierarchical categories. For example, you can create "MyApplication.GameFlow," "MyApplication.AI," "
  MyApplication.UI," and so on, to hold different logical components of your game.
- Align namespace with directory structure: The namespace should match the directory path relative to the Scripts folder.
  For example, a file at `Assets/OurGame/Scripts/Runtime/Foo/Bar.cs` should use the namespace `Foo.Bar`.

## Design

- Use the early return pattern in conditional branches whenever possible. Prefer early return if the condition is not
  met over nested if statements.
    ```csharp
    public void ProcessData(Data data)
    {
        if (data == null || !data.IsValid)
        {
            return;
        }

        // process...
    }
    ```

## Comments

Comments should be written in English.

### XML Documentation Comments

- All public classes and methods must have XML documentation comments. See https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/xmldoc/recommended-tags for available tags.
    ```csharp
    /// <summary>
    /// A class that manages the player's state.
    /// </summary>
    public class CharacterController : MonoBehaviour
    {
        /// <summary>
        /// Take damage to the character.
        /// </summary>
        /// <param name="amount">Damage amount</param>
        /// <returns>True: Character is alive</returns>
        public bool TakeDamage(float amount) { ... }
    }
    ```
- When implementing an interface or abstract class, only write the inherit comment.
    ```csharp
    /// <inheritdoc/>
    public class MyClass : AbstractClass {}
    ```

### Comments in the Code

- In the comments, provide a reason for "why not." If other implementation methods are seemingly possible, explain why that method was not chosen.
    ```csharp
    private List<Player> _activePlayers = new List<Player>();
    // Reasons for using List instead of Dictionary<int, Player>:
    // Since the number of players is small and there are no frequent lookup operations,
    //We prioritize memory efficiency and iteration speed.
    ```

### Update Comments

- If you modify your code, ensure that you update the corresponding comments as well.
- Old comments can be misleading, so update them to reflect the current code.
- Be proactive in deleting comments that you deem unnecessary.
