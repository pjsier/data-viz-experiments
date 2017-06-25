import pandas as pd
import numpy as np
import json
from shapely.geometry import shape, Point, Polygon, mapping

def remove_diff(geo_features):
    shape_list = []
    diff_shapes = []
    for f in geo_features:
        geo_feat = shape(f['geometry'])
        if geo_feat.is_valid:
            shape_list.append(geo_feat)

    for idx, shp in enumerate(shape_list):
        if len(shape_list) - idx > 1:
            for diff_shp in shape_list[idx+1:]:
                shp = shp.difference(diff_shp)
        geom_obj = mapping(shp)
        diff_shapes.append({
            'type': 'Feature',
            'properties': {
                'contour': geo_features[idx]['properties']['contour']
            },
            'geometry': geom_obj
        })
    return diff_shapes

def load_geo():
    feat_obj = {}

    for i in range(1, 366):
        with open('grid_output/{}_iso.json'.format(i), 'r') as f:
            geo_obj = json.load(f)
        geo_obj['features'] = remove_diff(geo_obj['features'])
        if not feat_obj.get('features'):
            feat_obj = geo_obj
        else:
            feat_obj['features'].extend(geo_obj['features'])
    return feat_obj

if __name__ == '__main__':
    feat_obj = load_geo()
    with open('data/combined_all_grid.geojson', 'w') as f:
        json.dump(feat_obj, f)
