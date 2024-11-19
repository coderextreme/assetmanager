#version 300 es
precision mediump float;
uniform mat4 mvp;

in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in vec4 vertexColor;

out vec2 fragTexCoord;
out vec4 fragColor;
out vec3 fragNormal;
out vec3 fragPosition;

uniform mat4 view;

void main()
{
    gl_Position = mvp * vec4(vertexPosition, 1.0);
    fragNormal = vertexNormal;
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
    fragPosition = vertexPosition;
}
