import os
import json
import requests
from time import sleep

MAPZEN_BASE = 'https://matrix.mapzen.com/isochrone?api_key={}&json='.format(os.getenv('MAPZEN_KEY'))
MAPZEN_OBJ = {
    "locations": [],
    "costing": "multimodal",
    "denoise": 0.9,
    "polygons": True,
    "generalize": 50,
    "costing_options": {
        "pedestrian": {
            "use_ferry": 0,
            "transit_start_end_max_distance": 100000,
            "transit_transfer_max_distance": 100000
        },
        "transit": { "filters": {} }
    },
    "contours": [
        {"time":10},
        {"time":30},
        {"time":60},
        {"time":90}
    ],
    "date_time": {
        "type": 1,
        "value": "2017-06-26T09:00"
    }
}

def centroid(geom_list):
    x_list = [pt[0] for pt in geom_list]
    y_list = [pt[1] for pt in geom_list]

    return (sum(x_list)/len(x_list), sum(y_list)/len(y_list))

if __name__ == '__main__':
    with open('data/chicago_grid.geojson', 'r') as gf:
        chi_grid = json.load(gf)

    for g in chi_grid['features']:
        pt = centroid(g['geometry']['coordinates'][0])
        g_id = g['properties']['id']

        req_body = MAPZEN_OBJ.copy()
        req_body['locations'] = [{'lat': pt[1], 'lon': pt[0]}]

        res = requests.get(MAPZEN_BASE + json.dumps(req_body))
        with open('grid_output/{}_iso.json'.format(g_id), 'w') as f:
            json.dump(res.json(), f)
        sleep(0.3)
