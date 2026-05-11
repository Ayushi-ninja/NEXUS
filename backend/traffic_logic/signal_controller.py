class SignalController:
    def __init__(self):
        self.current_green = "North"
        self.timer = 30

    def calculate_signal(self, lane_data, emergency_lane=None):

        # Emergency override
        if emergency_lane:
            return {
                "current_green": emergency_lane,
                "timer": 90,
                "emergency": True
            }

        # Find busiest lane
        max_lane = max(lane_data, key=lane_data.get)
        density = lane_data[max_lane]

        # Dynamic timing logic
        if density > 20:
            green_time = 60
        elif density > 10:
            green_time = 40
        else:
            green_time = 20

        return {
            "current_green": max_lane,
            "timer": green_time,
            "emergency": False
        }