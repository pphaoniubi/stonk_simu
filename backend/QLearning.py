import numpy as np
import random
import tensorflow as tf
from keras import layers, models
from collections import deque

# Define the environment (simplified stock environment)
class StockEnv:
    def __init__(self, stock_prices):
        self.stock_prices = stock_prices  # List of stock prices for simulation
        self.current_step = 0            # Keeps track of the current time step

    def reset(self):
        """Reset the environment to the initial state."""
        self.current_step = 0
        return self.stock_prices[self.current_step]

    def step(self, action):
        """
        Perform the action, and return the next state, reward, and if the episode is done.
        
        Args:
            action (int): 0 = Hold, 1 = Buy, 2 = Sell
        
        Returns:
            next_state: The next stock price (next step in the time series)
            reward: The reward for taking the action
            done: Whether the episode is over (end of the time series)
        """
        current_price = self.stock_prices[self.current_step]
        next_state = self.stock_prices[self.current_step + 1] if self.current_step + 1 < len(self.stock_prices) else None

        reward = 0
        if action == 1:  # Buy
            reward = next_state - current_price if next_state is not None else 0
        elif action == 2:  # Sell
            reward = current_price - next_state if next_state is not None else 0

        self.current_step += 1
        done = self.current_step >= len(self.stock_prices) - 1  # End of data
        
        return next_state, reward, done


# Define the Deep Q-Network (DQN) agent
class DQNAgent:
    def __init__(self, actions, alpha=0.1, gamma=0.9, epsilon=1.0, epsilon_min=0.01, epsilon_decay=0.995, batch_size=32, memory_size=1000):
        """
        Initialize DQN parameters.
        
        Args:
            actions (list): List of possible actions (e.g., [0, 1, 2] for Hold, Buy, Sell)
            alpha (float): Learning rate
            gamma (float): Discount factor
            epsilon (float): Exploration rate
            epsilon_min (float): Minimum epsilon value
            epsilon_decay (float): Decay rate for epsilon
            batch_size (int): Batch size for experience replay
            memory_size (int): Maximum size of the replay buffer
        """
        self.actions = actions
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size
        self.memory_size = memory_size

        self.memory = deque(maxlen=memory_size)  # Replay buffer

        # Build the Q-network (model)
        self.model = self.build_model()

        # Build the target Q-network (model)
        self.target_model = self.build_model()
        self.target_model.set_weights(self.model.get_weights())  # Initialize with the same weights

    def build_model(self):
        """Build the neural network model for Q-learning."""
        model = models.Sequential([
            layers.Dense(64, input_dim=1, activation='relu'),  # Input layer for stock price
            layers.Dense(64, activation='relu'),  # Hidden layer
            layers.Dense(len(self.actions), activation='linear')  # Output layer for Q-values for each action
        ])
        model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=self.alpha), loss='mse')
        return model
    
    def remember(self, state, action, reward, next_state, done):
        """Store experience in the replay buffer."""
        self.memory.append((state, action, reward, next_state, done))
    
    def act(self, state):
        """Choose action using epsilon-greedy strategy."""
        if random.uniform(0, 1) < self.epsilon:
            return random.choice(self.actions)  # Explore: Random action
        else:
            q_values = self.model.predict(np.array([[state]]))  # Predict Q-values for current state
            return np.argmax(q_values[0])  # Exploit: Best action (with highest Q-value)

    def replay(self):
        """Sample a batch of experiences and train the model."""
        if len(self.memory) < self.batch_size:
            return

        batch = random.sample(self.memory, self.batch_size)
        
        for state, action, reward, next_state, done in batch:
            # Compute target Q value
            target = reward
            if not done:
                target += self.gamma * np.max(self.target_model.predict(np.array([[next_state]])))

            # Train the model with target Q value
            target_f = self.model.predict(np.array([[state]]))
            target_f[0][action] = target

            self.model.fit(np.array([[state]]), target_f, epochs=1, verbose=0)

    def update_target_model(self):
        """Update target model with current model's weights."""
        self.target_model.set_weights(self.model.get_weights())

    def train(self, env, episodes):
        """Train the agent over multiple episodes."""
        for episode in range(episodes):
            state = env.reset()
            done = False
            total_reward = 0
            while not done:
                action = self.act(state)
                next_state, reward, done = env.step(action)
                self.remember(state, action, reward, next_state, done)
                self.replay()
                state = next_state
                total_reward += reward

            # Update the target model periodically
            if episode % 10 == 0:
                self.update_target_model()

            # Epsilon decay
            if self.epsilon > self.epsilon_min:
                self.epsilon *= self.epsilon_decay

            print(f"Episode {episode + 1}: Total Reward = {total_reward}, Epsilon = {self.epsilon}")


# Example: Training the DQN agent on stock prices

# Simulate some stock price data
stock_prices = [100, 102, 105, 103, 101, 107, 110, 108, 112, 115]  # Example stock prices

# Initialize the environment and agent
env = StockEnv(stock_prices)
actions = [0, 1, 2]  # 0 = Hold, 1 = Buy, 2 = Sell
agent = DQNAgent(actions)

# Train the agent
agent.train(env, episodes=10000)

# Test the agent after training
state = env.reset()
done = False
total_profit = 0
while not done:
    action = agent.act(state)
    next_state, reward, done = env.step(action)
    total_profit += reward
    state = next_state

print(f"Total profit from trained agent: {total_profit}")
