import json
import pandas as pd
import numpy as np
from shapely.geometry import shape, Point, Polygon

CONTOUR_MAP = {
    10: 9,
    30: 7,
    60: 4,
    90: 1
}

def create_poly_points(geo_obj):
    shape_list = [shape(f['geometry']) for f in geo_obj['features']]
    point_dicts = []

    # http://portolan.leaffan.net/category/shapely/
    for idx, poly in enumerate(shape_list):
        print(idx)
        bounds = poly.bounds
        ll = bounds[:2]
        ur = bounds[2:]
        step_interval = 0.005
        contour = geo_obj['features'][idx]['properties']['contour']

        for x in np.arange(ll[0], ur[0], step_interval):
            for y in np.arange(ll[1], ur[1], step_interval):
                point = Point(x, y)
                if point.within(poly):
                    for i in range(CONTOUR_MAP[contour]):
                        point_dicts.append({
                            'lat': point.y,
                            'lon': point.x,
                            'contour': contour
                        })
    return point_dicts

if __name__ == '__main__':
    with open('data/combined_all_grid.geojson', 'r') as f:
        geo_obj = json.load(f)
    point_dicts = create_poly_points(geo_obj)
    point_df = pd.DataFrame(point_dicts)
    point_df.to_csv('data/combined_iso_points.csv', index=False)
