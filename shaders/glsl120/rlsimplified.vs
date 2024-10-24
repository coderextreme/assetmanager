#version 120

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec4 position;

in float a;
in float b;
in float c;
in float d;
in float tdelta;
in float pdelta;

varying float r;

void main()
{
    r = a + b * cos(c * tdelta) * cos(d * pdelta);
    gl_Position = projection * view * model * vec4(position.xyz, r);
}

