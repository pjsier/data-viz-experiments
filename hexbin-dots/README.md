# Hexbin Dot Maps

Using 311 calls from the [Chicago open data portal](https://data.cityofchicago.org/)
as an input, creating scaled hexbin dot maps of different 311 call types across the city.

Rather than just use size for scaling, the less frequently occurring call types
have larger grid sizes, but all calls have the same maximum dot size making the
less common calls more spread out rather than smaller. Making the radius sizes
different by increments of two makes the patterns more interesting.

Results can be saved as static SVG files using [svg-crowbar](https://github.com/NYTimes/svg-crowbar)
