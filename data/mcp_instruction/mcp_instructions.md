# create_jira_project

* Check the requester's role/access information.
* **Manager:** allowed to perform this action.
* **TLS / Employee:** not allowed to perform this action → **DENY**.
* If the requester is authorized, check that all required information is provided:

  * `name`
  * `key`
* If any required information is missing or unclear → **DENY: information is incomplete**.
* If requester is authorized and all required information is available → **CALL `create_jira_project` MCP tool**.
* **Keywords:** create Jira project, new project, create project, Jira project creation, make a project, start a project, project name, project key.

# get_jira_project_info

* Check the requester's role/access information.
* **Manager, TLS, Employee:** allowed to perform this action.
* If the requester is not authorized → **DENY**.
* If authorized, check that the required information is provided:

  * `project_id_or_key`
* If the required information is missing or unclear → **DENY: information is incomplete**.
* If requester is authorized and all required information is available → **CALL `get_jira_project_info` MCP tool**.
* **Keywords:** get Jira project, project information, project details, view project, check project, find project, project status, project ID, project key.

# add_user_to_project

* Check the requester's role/access information.
* **Manager:** allowed to perform this action.
* **TLS / Employee:** not allowed to perform this action → **DENY**.
* If the requester is authorized, check that all required information is provided:

  * `project_id_or_key`
  * `user_account_id`
  * `role_id`
* If any required information is missing or unclear → **DENY: information is incomplete**.
* If requester is authorized and all required information is available → **CALL `add_user_to_project` MCP tool**.
* **Keywords:** add user to Jira project, add member, add user, invite user, project member, project access, assign project role, add user to project, user account ID, role ID.

# create_jira_issue

* Check the requester's role/access information.
* **Manager, TLS, Employee:** allowed to perform this action.
* If the requester is not authorized → **DENY**.
* If authorized, check that all required information is provided:

  * `project_id_or_key`
  * `summary`
  * `description` and `issue_type` are optional.
* If any required information is missing or unclear → **DENY: information is incomplete**.
* If requester is authorized and all required information is available → **CALL `create_jira_issue` MCP tool**.
* **Keywords:** create Jira issue, create issue, new issue, create ticket, new ticket, report issue, report problem, Jira ticket, issue summary, issue description, issue type.

# assign_jira_issue

* Check the requester's role/access information.
* **Manager, TLS, Employee:** allowed to perform this action.
* If the requester is not authorized → **DENY**.
* If authorized, check that all required information is provided:

  * `issue_id_or_key`
  * `user_account_id`
* If any required information is missing or unclear → **DENY: information is incomplete**.
* If requester is authorized and all required information is available → **CALL `assign_jira_issue` MCP tool**.
* **Keywords:** assign Jira issue, assign issue, assign ticket, assign task, assign to user, change assignee, issue assignee, ticket assignee, user account ID.

# resolve_jira_issue

* Check the requester's role/access information.
* **Manager, TLS, Employee:** allowed to perform this action.
* If requester is not authorized → **DENY**.
* If authorized, check that the required information is provided:

  * `issue_id_or_key`
* If the required information is missing or unclear → **DENY: information is incomplete**.
* If requester is authorized and all required information is available → **CALL `resolve_jira_issue` MCP tool**.
* **Keywords:** resolve Jira issue, resolve issue, close issue, close ticket, complete issue, complete ticket, mark as resolved, fix issue, resolve Jira ticket, issue ID, issue key.