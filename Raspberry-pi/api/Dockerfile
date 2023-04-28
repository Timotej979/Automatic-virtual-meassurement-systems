FROM python:3.10

###################### Add dependencies for different DB conectors if needed ######################
RUN apt-get update -y && \ 
    apt-get upgrade -y && \
    python -m pip install --upgrade pip && \
    # Install circuit python libraries
    apt-get install python3-pip && \
    pip3 install adafruit-blinka && \
    pip3 install adafruit-circuitpython-dht && \
    pip3 install adafruit-circuitpython-mcp3xxx && \
    # Install poetry libraries
    apt-get install -y curl && \
    curl -sSL https://install.python-poetry.org | python3 - --version "$APP_POETRY_VERSION" 

###################### Add local path ###################### 
ENV PATH=/root/.local/bin:$PATH

###################### Set workdir in docker container and copy files over ###################### 
WORKDIR /api
COPY pyproject.toml ./

###################### Configure poetry and install desired packages ######################
RUN poetry config virtualenvs.in-project true --local && poetry install --only main

###################### Copy python files over ######################
COPY . /api