TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_employee_details",
            "description": (
                "Get employee details using employee ID. "
                "Use the authenticated employee's ID for 'my' or 'myself' requests. "
                "For another employee, provide that employee's ID."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": (
                            "Employee ID of the person whose details are requested."
                        ),
                    }
                },
                "required": ["employee_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_details",
            "description": (
                "Get project details using project ID."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "Project ID to look up.",
                    }
                },
                "required": ["project_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_system_access",
            "description": (
                "Get systems accessible by an employee. "
                "Use the authenticated employee's ID for 'my' requests. "
                "For another employee, provide that employee's ID."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": (
                            "Employee ID of the person whose system access is requested."
                        ),
                    }
                },
                "required": ["employee_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_employee_configurations",
            "description": (
                "Get device and configuration information for an employee. "
                "Use the authenticated employee's ID for 'my' requests. "
                "For another employee, provide that employee's ID."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": (
                            "Employee ID of the person whose configuration is requested."
                        ),
                    }
                },
                "required": ["employee_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_jira_account",
            "description": (
                "Get Jira account details for an employee. "
                "Use the authenticated employee's ID for 'my' requests. "
                "For another employee, provide that employee's ID."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": (
                            "Employee ID of the person whose Jira account is requested."
                        ),
                    }
                },
                "required": ["employee_id"],
            },
        },
    },
]