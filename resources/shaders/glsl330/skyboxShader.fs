#version 300 es
precision mediump float;

in vec3 fragPosition;
uniform samplerCube environmentMap;
out vec4 finalColor;

void main() {
    vec3 color = vec3(0.0);
    color = texture(environmentMap, fragPosition).rgb;
    finalColor = vec4(color, 1.0);
}
