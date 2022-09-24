import base64
from glob import glob
from io import BytesIO
import os.path

import cv2
import random
import numpy as np
import onnxruntime as ort
from PIL import Image

from fastapi import FastAPI
from fastapi import HTTPException


def get_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue())
    return "data:image/jpeg;base64," + img_str.decode()


def letterbox(im, new_shape=(1280, 1280), color=(114, 114, 114), auto=True, scaleup=True, stride=32):
    # Resize and pad image while meeting stride-multiple constraints
    shape = im.shape[:2]  # current shape [height, width]
    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)

    # Scale ratio (new / old)
    r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
    if not scaleup:  # only scale down, do not scale up (for better val mAP)
        r = min(r, 1.0)

    # Compute padding
    new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]  # wh padding

    if auto:  # minimum rectangle
        dw, dh = np.mod(dw, stride), np.mod(dh, stride)  # wh padding

    dw /= 2  # divide padding into 2 sides
    dh /= 2

    if shape[::-1] != new_unpad:  # resize
        im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    im = cv2.copyMakeBorder(im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)  # add border
    return im, r, (dw, dh)


session = ort.InferenceSession("./model/best.onnx", providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
names = ['white_bear']
colors = {name:[random.randint(0, 255) for _ in range(3)] for i,name in enumerate(names)}


app = FastAPI(title="AI Model")


@app.get("/detection", response_description="Bear detection")
async def detection(input_source: str):
    try:
        input_source = input_source if os.path.isdir(input_source) else os.path.dirname(input_source)
        predict_result = {}
        files = glob(os.path.join(input_source, '*.jpg')) + glob(os.path.join(input_source, '*.jpeg')) + glob(os.path.join(input_source, '*.png')) + glob(os.path.join(input_source, '*.JPG')) + glob(os.path.join(input_source, '*.JPEG')) + glob(os.path.join(input_source, '*.PNG'))
        save_folder_path = os.path.join(input_source, 'result')
        if not os.path.exists(save_folder_path):
            os.makedirs(save_folder_path)
        for file_name in files:
            img = cv2.imread(file_name)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            image = img.copy()
            image, ratio, dwdh = letterbox(image, auto=False)
            image = image.transpose((2, 0, 1))
            image = np.expand_dims(image, 0)
            image = np.ascontiguousarray(image)
            im = image.astype(np.float32)
            im /= 255
            outname = [i.name for i in session.get_outputs()]
            inname = [i.name for i in session.get_inputs()]
            inp = {inname[0]:im}
            outputs = session.run(outname, inp)[0]
            ori_images = [img.copy()]
            predict_points = []
            for i, (batch_id,x0,y0,x1,y1,cls_id,score) in enumerate(outputs):
                if cls_id != 0: continue
                image = ori_images[int(batch_id)]
                box = np.array([x0,y0,x1,y1])
                box -= np.array(dwdh*2)
                box /= ratio
                box = box.round().astype(np.int32).tolist()
                cls_id = int(cls_id)
                score = round(float(score),3)
                name = names[cls_id]
                color = colors[name]
                name += ' '+str(score)
                cv2.rectangle(image,box[:2],box[2:],color,2)
                predict_points.append(((box[0]+box[2])/2, (box[1] + box[3])/2))
                cv2.putText(image,name,(box[0], box[1] - 2),cv2.FONT_HERSHEY_SIMPLEX,0.75,[225, 255, 255],thickness=2)
            if len(predict_points) > 0:
                save_path = os.path.join(save_folder_path, os.path.basename(file_name))
                Image.fromarray(ori_images[0]).save(save_path)
                predict_result[save_path] = predict_points
            else:
                predict_result[file_name] = []
        result_of_classification = {"predict_result": predict_result}
    except Exception as e:
        raise HTTPException(404, str(e))
    return result_of_classification
