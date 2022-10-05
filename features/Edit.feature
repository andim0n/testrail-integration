Feature: Create and delete cards

  Scenario: User create card
    Given User on create card page
    When User creates card
    Then Card created

  Scenario: User delete card
    Given User on delete card page
    When User deletes card
    Then Card deleted