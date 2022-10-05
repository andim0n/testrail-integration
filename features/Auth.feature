Feature: Authorization

  Background:
    Given User knows login
    And User knows password

  Scenario: User login
    Given User on login page
    When User enter credentials
    Then User logged in

  Scenario: User Logout
    Given User logged in
    When User logs out
    Then User logged out