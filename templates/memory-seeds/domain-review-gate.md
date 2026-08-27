# Domain vocabulary passes the operator before dispatch

The operator is the domain expert; the agent is not. Any NEW or CHANGED domain vocabulary - table
and column names, enum values, units, the contract of a domain object - is reviewed by the operator,
in the operator's language, BEFORE the ticket is dispatched.

An approved plan is not approved vocabulary. A plan can be right about the work and wrong about the
words, and a wrong word ships into the schema, the UI and the docs at once.
