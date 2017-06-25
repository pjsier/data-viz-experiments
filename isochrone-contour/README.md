# 3D Isochrone Contour Map

Scripts and notes for creating a topographic-like map of Chicago with heights generated
from transit accessibility measured by isochrones across the city.

Use normalized grid of center points across Chicago, get isochrones at one time
(2017-06-24 9:00 AM) from each, invert the timings (15 becomes 60, vice-versa),
then generate averages across all of these shapes (in `mapzen_grid.py`).

Then, `clean_iso_geojson.py` removes the difference of shapes from each other to
get only the areas unique to a contour time. Running `convert_geo_iso_points.py`
on this creates a grid of points from each shape to make it easier to convert to
a raster dataset later.

From there, the output CSV can be loaded into QGIS and a hexagon grid can be created
from the points, where it should get the sum of the values. From that grid of polygons,
get the centroids which will produce a normalized grid. Use one of the interpolation
functions (with a cell size around 0.001 if using EPSG 4326) and the value attribute
column as an input.

Then, install the QGIS plugin [DEMto3D](https://plugins.qgis.org/plugins/DEMto3D/),
using the layer bounds of the raster as the input, making sure the spacing is 1-2mm,
and increase the exaggeration of features as desired. That will generate an STL file
for use in 3D modeling software.
