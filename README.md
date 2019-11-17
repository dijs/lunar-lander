# Lunar Lander

I have been feeling like making games. A favorite of mine is the classic lunar lander. Space, physics, thrusters, danger level 9000!

I kept it quite simple and focused on getting the movement of the ship correct rather than focusing on the landscape.

Demo is [here](https://dijs.github.io/lunar-lander/)

Source is [here](https://github.com/dijs/lunar-lander)

One interesting part of my code renders the stars without ever storing their position in a data structure. Their presence and location is determined by a custom seeded random function.

I have plans on using this game as a platform for teaching a machine learning agent to pilot the landing craft using reinforcement learning. But, finding a way to score each decsion the pilot makes is a tough problem.
