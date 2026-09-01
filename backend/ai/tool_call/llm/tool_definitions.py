TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_employee_details",
            "description": "Get employee details using employee ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string"
                    }
                },
                "required": ["employee_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_details",
            "description": "Get project details using project ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string"
                    }
                },
                "required": ["project_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_system_access",
            "description": "Get systems accessible by an employee.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string"
                    }
                },
                "required": ["employee_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_employee_configurations",
            "description": "Get an employee's device configuration.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string"
                    }
                },
                "required": ["employee_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_jira_account",
            "description": "Get Jira account details for an employee.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string"
                    }
                },
                "required": ["employee_id"]
            }
        }
    }
]