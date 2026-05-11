from ultralytics import YOLO
import cv2

model = YOLO("yolov8n.pt")

video_path = "traffic.mp4"

cap = cv2.VideoCapture(video_path)

while cap.isOpened():
    success, frame = cap.read()

    if not success:
        break

    results = model(frame)

    annotated_frame = results[0].plot()

    cv2.imshow("Traffic Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

vehicle_classes = ["car", "truck", "bus", "motorcycle"]

vehicle_count = 0

for result in results:
    for box in result.boxes:
        cls = int(box.cls[0])
        class_name = model.names[cls]

        if class_name in vehicle_classes:
            vehicle_count += 1

density = min((vehicle_count / 50) * 100, 100)

if density > 80:
    green_time = 60

elif density > 50:
    green_time = 40

else:
    green_time = 20