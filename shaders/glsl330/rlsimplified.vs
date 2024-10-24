#version 330

in mat4 model;
in mat4 view;
in mat4 projection;
in vec4 position;

in float a;
in float b;
in float c;
in float d;
in float tdelta;
in float pdelta;

void main()
{
    // Use the uniforms in some way to prevent them from being optimized out
    float value = a + b + c + d + tdelta + pdelta;
    gl_Position = projection * view * model * position;
}

