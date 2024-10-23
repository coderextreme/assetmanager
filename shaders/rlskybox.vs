#version 330

varying vec3 position;
in vec2 texCoord;

out vec2 v_texCoord;

void main()
{
    v_texCoord = texCoord;
    gl_Position = vec4(position, 0.0);
}
