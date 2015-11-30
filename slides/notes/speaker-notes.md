# Speaker Notes

## Why not REST
	* Fetching complex data might require multiple round trips
	* fields and endpoints change overtime and as a result there might be compact vs full parameters to pass to queries
	* rest end points are usually weakly typed and lack metadata
	* not always ideal for client consumption
	
## Comparison to Falcor
	* FalcorJS and GraphQL are tackling the same problem (querying data, managing data).
	* The important distinction is that GraphQL is a query language and FalcorJS is not.
	* When you are asking FalcorJS for resources, you are very explicitly asking for finite series of values. Falcor is not as dynamic
	* GraphQL is set based: give me all records where true, order by this, etc. In this sense, GraphQL query language is more powerful than FalcorJS.
	* With GraphQL you have a powerful query language, but you have to interpret that query language on the server.
	


